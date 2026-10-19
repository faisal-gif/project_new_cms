<?php

namespace App\Http\Controllers;

use App\Http\Requests\AffiliateFormRequest;
use App\Models\Affiliate;
use App\Models\WriterBerbayar;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Admin program afiliasi: kelola afiliator.
 *
 * Tabelnya dibuat aplikasi publik (kopi.times.co.id) dan DB-nya dipakai bersama,
 * jadi CMS tidak punya migration untuk tabel ini.
 */
class AffiliateController extends Controller
{
    use \App\Http\Controllers\Concerns\ScopesAffiliateSite;

    public function index(Request $request)
    {
        $situs = $this->situs($request);

        $query = Affiliate::query()
            // Afiliator kini terikat satu situs lewat kolom `type`, jadi pelingkupannya
            // langsung — tidak perlu lagi ditebak dari asal komisinya.
            ->where('type', $situs)
            ->with('upline:id,name,code')
            ->withCount('referrals')
            // Ringkasan komisi per afiliator. Dihitung lewat subquery supaya tidak N+1.
            ->withSum(['commissions as komisi_tertahan' => fn($q) => $q->where('status', 'accrued')], 'amount')
            ->withSum(['commissions as komisi_siap_cair' => fn($q) => $q->where('status', 'approved')->whereNull('payout_id')], 'amount')
            ->withSum(['commissions as komisi_dibayar' => fn($q) => $q->where('status', 'paid')], 'amount');

        if ($request->filled('search')) {
            $cari = $request->search;
            $query->where(function ($q) use ($cari) {
                $q->where('name', 'like', "%{$cari}%")
                    ->orWhere('code', 'like', "%{$cari}%")
                    ->orWhere('email', 'like', "%{$cari}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Admin/Affiliate/Index', [
            'affiliates' => $query->latest('id')->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
            'referralBase' => rtrim(config('services.berbayar.kt_url'), '/') . '/?ref=',
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    /**
     * Antrean pengajuan: baris `pending` di situs ini.
     *
     * Sejak aplikasi publik punya formulir pengajuan, baris pending bisa datang dari
     * member sendiri — ditandai `terms_accepted_at` yang terisi.
     *
     * Uplinenya BISA sudah terisi: aplikasi publik mengisinya otomatis dari afiliator
     * yang dulu merekrut orang ini jadi member, bila perekrutnya aktif dan di situs yang
     * sama. Yang kosong berarti ia mendaftar tanpa link referral — admin menetapkannya
     * di sini. Menyetujui tanpa memilih apa pun mempertahankan upline yang sudah ada.
     */
    public function applications(Request $request)
    {
        $pengajuan = Affiliate::where('type', $this->situs($request))
            ->where('status', 'pending')
            ->with('user:id,nama,email,status,dateexp', 'upline:id,name,code')
            ->orderBy('created_at')
            ->paginate(20)
            ->through(fn($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'code' => $a->code,
                'email' => $a->email,
                'phone' => $a->phone,
                'applicant_note' => $a->applicant_note,
                'terms_accepted_at' => $a->terms_accepted_at,
                'mandiri' => $a->isPengajuanMandiri(),
                'created_at' => $a->created_at,
                // Terisi = sudah ditentukan otomatis dari perekrut membernya.
                'upline' => $a->upline ? [
                    'id' => $a->upline->id,
                    'name' => $a->upline->name,
                    'code' => $a->upline->code,
                ] : null,
                'payout_method' => $a->payout_method,
                'bank_name' => $a->bank_name,
                'bank_account_number' => $a->bank_account_number,
                'bank_account_name' => $a->bank_account_name,
                // Status membership pemohon, supaya admin tahu ia member aktif atau bukan.
                'member' => $a->user ? [
                    'nama' => $a->user->nama,
                    'email' => $a->user->email,
                    'aktif' => (int) $a->user->status === 1,
                    'dateexp' => $a->user->dateexp,
                ] : null,
            ]);

        return Inertia::render('Admin/Affiliate/Applications', [
            'applications' => $pengajuan,
            'uplines' => $this->opsiUpline($this->situs($request)),
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    /** Setujui pengajuan, sekalian menetapkan upline bila ada. */
    public function approveApplication(Request $request, $id)
    {
        $situs = $this->situs($request);

        $data = $request->validate([
            'upline_id' => [
                'nullable',
                'integer',
                Rule::exists('mysql_berbayar.affiliates', 'id')->where('type', $situs),
            ],
        ], ['upline_id.exists' => 'Upline harus afiliator di situs yang sama.']);

        $affiliate = Affiliate::findOrFail($id);
        abort_unless($this->milikSitus($affiliate, $request), 404);

        if ($affiliate->status !== 'pending') {
            return back()->withErrors(['error' => 'Pengajuan ini sudah diproses.']);
        }

        if (Affiliate::wouldLoop($affiliate->id, $data['upline_id'] ?? null)) {
            return back()->withErrors(['upline_id' => 'Upline ini membentuk lingkaran.']);
        }

        $affiliate->update([
            'status' => 'active',
            'approved_at' => now(),
            // Kunci yang DIKIRIM dipakai apa adanya, termasuk null — itulah cara admin
            // membatalkan upline yang terisi otomatis. Hanya bila kuncinya sama sekali
            // tidak dikirim, upline yang sudah ada dipertahankan.
            'upline_id' => array_key_exists('upline_id', $data)
                ? $data['upline_id']
                : $affiliate->upline_id,
        ]);

        return back()->with('success', "Pengajuan {$affiliate->name} disetujui.");
    }

    /** Tolak pengajuan; alasannya wajib dan disimpan di catatan admin. */
    public function rejectApplication(Request $request, $id)
    {
        $data = $request->validate(
            ['note' => ['required', 'string', 'max:255']],
            ['note.required' => 'Alasan penolakan wajib diisi.']
        );

        $affiliate = Affiliate::findOrFail($id);
        abort_unless($this->milikSitus($affiliate, $request), 404);

        if ($affiliate->status !== 'pending') {
            return back()->withErrors(['error' => 'Pengajuan ini sudah diproses.']);
        }

        $affiliate->update(['status' => 'inactive', 'note' => $data['note']]);

        return back()->with('success', "Pengajuan {$affiliate->name} ditolak.");
    }

    public function create(Request $request)
    {
        return Inertia::render('Admin/Affiliate/Create', [
            'uplines' => $this->opsiUpline($this->situs($request)),
            'initialData' => [
                // Digenerate di awal supaya admin bisa melihat & menyalin kodenya sebelum simpan.
                'code' => Affiliate::generateCode(),
            ],
            'referralBase' => rtrim(config('services.berbayar.kt_url'), '/') . '/?ref=',
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    public function store(AffiliateFormRequest $request)
    {
        $data = $request->validated();

        // approved_at menandai kapan afiliator mulai boleh menghasilkan komisi.
        $data['approved_at'] = $data['status'] === 'active' ? now() : null;
        // Afiliator terikat situs tempat ia dibuat.
        $data['type'] = $this->situs($request);

        $affiliate = Affiliate::create($data);

        return redirect()->route('admin.' . $this->prefixSitus($request) . 'affiliate.index')
            ->with('success', "Afiliator {$affiliate->name} berhasil dibuat dengan kode {$affiliate->code}.");
    }

    public function edit(Request $request, $id)
    {
        $affiliate = Affiliate::with('upline:id,name,code', 'user:id,nama,email')->findOrFail($id);
        abort_unless($this->milikSitus($affiliate, $request), 404);

        return Inertia::render('Admin/Affiliate/Edit', [
            'affiliate' => $affiliate,
            // Dirinya sendiri dikeluarkan dari pilihan upline; lingkaran yang lebih dalam
            // tetap dijaga validasi di server.
            'uplines' => $this->opsiUpline($this->situs($request), $affiliate->id),
            'referralBase' => rtrim(config('services.berbayar.kt_url'), '/') . '/?ref=',
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    public function update(AffiliateFormRequest $request, $id)
    {
        $affiliate = Affiliate::findOrFail($id);
        abort_unless($this->milikSitus($affiliate, $request), 404);

        $data = $request->validated();
        // Situs tidak pernah berpindah setelah baris dibuat.
        unset($data['type']);

        // Isi approved_at saat pertama kali menjadi active; jangan ditimpa bila sudah ada.
        if ($data['status'] === 'active' && !$affiliate->approved_at) {
            $data['approved_at'] = now();
        }

        $affiliate->update($data);

        return redirect()->route('admin.' . $this->prefixSitus($request) . 'affiliate.index')
            ->with('success', "Afiliator {$affiliate->name} berhasil diperbarui.");
    }

    /**
     * Aksi cepat setujui / tangguhkan dari halaman daftar.
     *
     * Penangguhan hanya menghentikan atribusi dan komisi BARU — komisi lama tidak ikut batal.
     */
    public function status(Request $request, $id)
    {
        $data = $request->validate(
            ['status' => ['required', Rule::in(['pending', 'active', 'suspended', 'inactive'])]],
            ['status.in' => 'Status tidak valid.']
        );

        $affiliate = Affiliate::findOrFail($id);
        abort_unless($this->milikSitus($affiliate, $request), 404);

        $ubah = ['status' => $data['status']];

        if ($data['status'] === 'active' && !$affiliate->approved_at) {
            $ubah['approved_at'] = now();
        }

        $affiliate->update($ubah);

        return back()->with('success', "Status {$affiliate->name} diubah menjadi {$data['status']}.");
    }

    /**
     * Cari akun member di tabel wartawan untuk ditautkan sebagai user_id.
     * Afiliator eksternal harus mendaftar dulu di aplikasi publik sebelum bisa ditautkan.
     */
    public function searchUser(Request $request)
    {
        $cari = trim((string) $request->get('q'));
        if (mb_strlen($cari) < 3) {
            return response()->json([]);
        }

        $users = WriterBerbayar::where('email', 'like', "%{$cari}%")
            ->orWhere('nama', 'like', "%{$cari}%")
            ->limit(20)
            ->get(['id', 'nama', 'email'])
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->nama . ' — ' . ($u->email ?: 'tanpa email'),
            ]);

        return response()->json($users);
    }

    /**
     * Pilihan upline: afiliator lain di SITUS YANG SAMA, tanpa dirinya sendiri.
     * Upline beda situs akan menerima komisi dari situs yang bukan miliknya.
     */
    private function opsiUpline(string $situs, ?int $kecuali = null)
    {
        return Affiliate::where('type', $situs)
            ->when($kecuali, fn($q) => $q->where('id', '<>', $kecuali))
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn($a) => ['value' => $a->id, 'label' => "{$a->name} ({$a->code})"]);
    }
}
