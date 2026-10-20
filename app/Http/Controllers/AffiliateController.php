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
            'referralBase' => $this->basisReferral($request),
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
     * Pengajuan mandiri SELALU masuk tanpa upline: upline menentukan penerima komisi
     * tingkat 2 (5%), dan itu keputusan admin, bukan kesimpulan sistem. Uplinenya hanya
     * terisi bila admin sudah menetapkannya lewat layar ubah afiliator sebelum pengajuan
     * disetujui. Menyetujui tanpa memilih apa pun mempertahankan nilai yang sudah ada.
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
                'tier2_eligible' => (bool) $a->tier2_eligible,
                'created_at' => $a->created_at,
                // Terisi hanya bila admin sudah menetapkannya lebih dulu.
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
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    /**
     * Setujui pengajuan, sekalian menentukan apakah akun ini berhak menerima komisi 5%.
     *
     * Upline-nya TIDAK ditentukan di sini: rantainya sudah diturunkan aplikasi publik
     * dari data referral saat pengajuan dibuat. Yang admin putuskan hanyalah penanda
     * `tier2_eligible` — dan itu menentukan jaringan si pemohon ke depan, bukan
     * uplinenya sendiri.
     */
    public function approveApplication(Request $request, $id)
    {
        $data = $request->validate(['tier2_eligible' => ['boolean']]);

        $affiliate = Affiliate::findOrFail($id);
        abort_unless($this->milikSitus($affiliate, $request), 404);

        if ($affiliate->status !== 'pending') {
            return back()->withErrors(['error' => 'Pengajuan ini sudah diproses.']);
        }

        $affiliate->update([
            'status' => 'active',
            'approved_at' => now(),
            // Kunci yang DIKIRIM dipakai apa adanya, termasuk false. Hanya bila kuncinya
            // sama sekali tidak dikirim, nilai yang sudah ada dipertahankan.
            'tier2_eligible' => array_key_exists('tier2_eligible', $data)
                ? (bool) $data['tier2_eligible']
                : $affiliate->tier2_eligible,
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
            'initialData' => [
                // Digenerate di awal supaya admin bisa melihat & menyalin kodenya sebelum simpan.
                'code' => Affiliate::generateCode(),
            ],
            'referralBase' => $this->basisReferral($request),
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
            'referralBase' => $this->basisReferral($request),
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

}
