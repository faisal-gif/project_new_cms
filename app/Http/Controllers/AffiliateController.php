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
            // Afiliator tidak punya kolom situs. Dilingkupkan lewat asal komisinya:
            // yang pernah menghasilkan komisi di situs ini, DITAMBAH yang belum punya
            // komisi sama sekali — kalau tidak, afiliator baru tidak akan terlihat
            // di layar mana pun.
            ->where(fn($q) => $q
                ->whereHas('commissions.payment.package', fn($p) => $p->where('type', $situs))
                ->orWhereDoesntHave('commissions'))
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

    public function create(Request $request)
    {
        return Inertia::render('Admin/Affiliate/Create', [
            'uplines' => $this->opsiUpline(),
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

        $affiliate = Affiliate::create($data);

        return redirect()->route('admin.' . $this->prefixSitus($request) . 'affiliate.index')
            ->with('success', "Afiliator {$affiliate->name} berhasil dibuat dengan kode {$affiliate->code}.");
    }

    public function edit(Request $request, $id)
    {
        $affiliate = Affiliate::with('upline:id,name,code', 'user:id,nama,email')->findOrFail($id);

        return Inertia::render('Admin/Affiliate/Edit', [
            'affiliate' => $affiliate,
            // Dirinya sendiri dikeluarkan dari pilihan upline; lingkaran yang lebih dalam
            // tetap dijaga validasi di server.
            'uplines' => $this->opsiUpline($affiliate->id),
            'referralBase' => rtrim(config('services.berbayar.kt_url'), '/') . '/?ref=',
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    public function update(AffiliateFormRequest $request, $id)
    {
        $affiliate = Affiliate::findOrFail($id);
        $data = $request->validated();

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

    /** Pilihan upline: afiliator lain, tanpa dirinya sendiri. */
    private function opsiUpline(?int $kecuali = null)
    {
        return Affiliate::when($kecuali, fn($q) => $q->where('id', '<>', $kecuali))
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn($a) => ['value' => $a->id, 'label' => "{$a->name} ({$a->code})"]);
    }
}
