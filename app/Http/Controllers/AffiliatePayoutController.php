<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliatePayout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Batch pencairan komisi.
 *
 * Dua invariant yang tidak dipaksakan database dan WAJIB dijaga di sini:
 *   1. amount batch = jumlah amount seluruh komisi yang payout_id-nya menunjuk batch ini
 *   2. satu batch hanya berisi komisi milik satu afiliator
 * Keduanya dijaga dengan menghitung total dari komisi yang dikunci di dalam transaksi,
 * bukan dari angka yang dikirim form.
 */
class AffiliatePayoutController extends Controller
{
    use \App\Http\Controllers\Concerns\ScopesAffiliateSite;

    public function index(Request $request)
    {
        $query = AffiliatePayout::with('affiliate:id,name,code')
            ->withCount('commissions')
            // Batch kini milik satu situs lewat kolom `type`; tidak ada lagi batch campuran.
            ->where('type', $this->situs($request))
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('affiliate_id'), fn($q) => $q->where('affiliate_id', $request->affiliate_id));

        return Inertia::render('Admin/Affiliate/Payout/Index', [
            'payouts' => $query->latest('id')->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'affiliate_id']),
            'affiliates' => $this->opsiAfiliator($this->situs($request)),
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    /** Pratinjau: komisi mana saja yang akan ditarik untuk afiliator & periode terpilih. */
    public function create(Request $request)
    {
        $affiliateId = $request->get('affiliate_id');
        $affiliate = $affiliateId ? Affiliate::find($affiliateId) : null;

        $komisi = $affiliate
            ? $this->komisiSiapCair($affiliate->id, $request->get('period_start'), $request->get('period_end'))
                ->with(['user:id,nama', 'payment:id,reference'])->get()
            : collect();

        return Inertia::render('Admin/Affiliate/Payout/Create', [
            'affiliates' => $this->opsiAfiliator($this->situs($request)),
            'affiliate' => $affiliate,
            'commissions' => $komisi,
            'total' => (int) $komisi->sum('amount'),
            'filters' => $request->only(['affiliate_id', 'period_start', 'period_end']),
            // Rekening wajib lengkap sebelum batch pertama dibuat.
            'rekeningLengkap' => $affiliate ? filled($affiliate->bank_account_number) && filled($affiliate->bank_account_name) : false,
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'affiliate_id' => ['required', 'integer', Rule::exists('mysql_berbayar.affiliates', 'id')],
            'period_start' => ['nullable', 'date'],
            'period_end' => ['nullable', 'date', 'after_or_equal:period_start'],
            'note' => ['nullable', 'string'],
        ], [
            'affiliate_id.required' => 'Afiliator wajib dipilih.',
            'period_end.after_or_equal' => 'Tanggal akhir tidak boleh sebelum tanggal awal.',
        ]);

        $affiliate = Affiliate::findOrFail($data['affiliate_id']);
        abort_unless($this->milikSitus($affiliate, $request), 404);

        if (blank($affiliate->bank_account_number) || blank($affiliate->bank_account_name)) {
            return back()->withErrors(['error' => 'Nomor dan nama pemilik rekening afiliator wajib diisi sebelum pencairan.']);
        }

        $situs = $this->situs($request);
        $minimum = (int) config('affiliate.min_payout', 50000);

        try {
            $payout = DB::connection('mysql_berbayar')->transaction(function () use ($affiliate, $data, $situs, $minimum) {
                // Dikunci supaya batch paralel tidak menarik komisi yang sama dua kali.
                // Difilter ke situs aktif: satu batch hanya boleh memuat satu situs.
                $komisi = $this->komisiSiapCair($affiliate->id, $data['period_start'] ?? null, $data['period_end'] ?? null)
                    ->where('type', $situs)
                    ->lockForUpdate()->get();

                if ($komisi->isEmpty()) {
                    throw new \RuntimeException('Tidak ada komisi siap cair untuk afiliator dan periode ini.');
                }

                $total = $komisi->sum('amount');
                if ($total < $minimum) {
                    throw new \RuntimeException(
                        'Total komisi Rp ' . number_format($total, 0, ',', '.') .
                        ' belum mencapai minimum pencairan Rp ' . number_format($minimum, 0, ',', '.') . '.'
                    );
                }

                // Total dihitung dari baris yang benar-benar dikunci -> invariant 1 terjaga.
                $payout = AffiliatePayout::create([
                    'type' => $situs,
                    'affiliate_id' => $affiliate->id,
                    'period_start' => $data['period_start'] ?? null,
                    'period_end' => $data['period_end'] ?? null,
                    'amount' => $total,
                    'method' => $affiliate->payout_method,
                    // Disalin saat batch dibuat supaya jadi bukti rekening pada saat itu.
                    'bank_name' => $affiliate->bank_name,
                    'bank_account_number' => $affiliate->bank_account_number,
                    'bank_account_name' => $affiliate->bank_account_name,
                    'status' => 'pending',
                    'note' => $data['note'] ?? null,
                ]);

                AffiliateCommission::whereIn('id', $komisi->pluck('id'))->update(['payout_id' => $payout->id]);

                return $payout;
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            Log::error('Buat batch pencairan gagal: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membuat batch pencairan: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.' . $this->prefixSitus($request) . 'affiliate-payout.show', $payout->id)
            ->with('success', 'Batch pencairan dibuat.');
    }

    public function show(Request $request, $id)
    {
        $payout = AffiliatePayout::with([
            'affiliate:id,name,code,email,phone',
            'commissions.user:id,nama',
            'commissions.payment:id,reference',
        ])->findOrFail($id);
        abort_unless($this->milikSitus($payout, $request), 404);

        // Invariant diperiksa saat ditampilkan, bukan diasumsikan:
        // 1) total batch = jumlah komisinya, 2) satu batch hanya satu situs.
        $jumlahKomisi = (int) $payout->commissions->sum('amount');
        $situsKomisi = $payout->commissions->pluck('type')->unique()->values();

        return Inertia::render('Admin/Affiliate/Payout/Show', [
            'payout' => $payout,
            'jumlahKomisi' => $jumlahKomisi,
            'selisih' => (int) $payout->amount - $jumlahKomisi,
            // Diisi hanya bila batch terlanjur memuat lebih dari satu situs (data lama).
            'situsCampuran' => $situsKomisi->count() > 1
                ? $situsKomisi->map(fn($t) => \App\Models\PaketBerita::labelSitus((string) $t))->all()
                : [],
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    /** Tandai lunas: isi referensi & bukti, semua komisi di batch jadi paid. */
    public function markPaid(Request $request, $id)
    {
        $data = $request->validate([
            'reference' => ['nullable', 'string', 'max:255'],
            'proof' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,pdf', 'max:4096'],
            'paid_at' => ['nullable', 'date'],
        ], ['proof.image' => 'Bukti transfer harus berupa gambar.']);

        $payout = AffiliatePayout::findOrFail($id);
        abort_unless($this->milikSitus($payout, $request), 404);

        if ($payout->status !== 'pending') {
            return back()->withErrors(['error' => 'Hanya batch berstatus pending yang bisa ditandai lunas.']);
        }

        // Unggah DI LUAR transaksi supaya I/O tidak menahan koneksi DB.
        $proofPath = $payout->proof_path;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('affiliate-payouts', 'public');
        }

        try {
            DB::connection('mysql_berbayar')->transaction(function () use ($payout, $data, $proofPath) {
                $waktu = $data['paid_at'] ?? now();

                $payout->update([
                    'status' => 'paid',
                    'reference' => $data['reference'] ?? null,
                    'proof_path' => $proofPath,
                    'paid_at' => $waktu,
                ]);

                AffiliateCommission::where('payout_id', $payout->id)
                    ->update(['status' => 'paid', 'paid_at' => $waktu]);
            });
        } catch (\Throwable $e) {
            Log::error('Tandai lunas gagal: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menandai lunas: ' . $e->getMessage()]);
        }

        return back()->with('success', 'Batch ditandai lunas.');
    }

    /** Batalkan: lepaskan komisinya kembali ke approved + payout_id NULL. */
    public function cancel(Request $request, $id)
    {
        $data = $request->validate(
            ['note' => ['required', 'string', 'max:255']],
            ['note.required' => 'Alasan pembatalan wajib diisi.']
        );

        $payout = AffiliatePayout::findOrFail($id);
        abort_unless($this->milikSitus($payout, $request), 404);

        if ($payout->status !== 'pending') {
            return back()->withErrors(['error' => 'Batch yang sudah lunas tidak bisa dibatalkan. Buat batch koreksi.']);
        }

        try {
            DB::connection('mysql_berbayar')->transaction(function () use ($payout, $data) {
                AffiliateCommission::where('payout_id', $payout->id)
                    ->update(['payout_id' => null, 'status' => 'approved']);

                $payout->update(['status' => 'cancelled', 'note' => $data['note']]);
            });
        } catch (\Throwable $e) {
            Log::error('Batalkan batch gagal: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membatalkan batch: ' . $e->getMessage()]);
        }

        return back()->with('success', 'Batch dibatalkan, komisinya dilepas kembali.');
    }

    /** Komisi approved milik satu afiliator yang belum masuk batch mana pun. */
    private function komisiSiapCair(int $affiliateId, ?string $awal, ?string $akhir)
    {
        return AffiliateCommission::siapCair()
            ->where('affiliate_id', $affiliateId)
            ->when($awal, fn($q) => $q->whereDate('created_at', '>=', $awal))
            ->when($akhir, fn($q) => $q->whereDate('created_at', '<=', $akhir));
    }

    /** Hanya afiliator situs aktif: batch tidak boleh lintas situs. */
    private function opsiAfiliator(?string $situs = null)
    {
        return Affiliate::when($situs, fn($q) => $q->where('type', $situs))
            ->orderBy('name')->get(['id', 'name', 'code'])
            ->map(fn($a) => ['value' => $a->id, 'label' => "{$a->name} ({$a->code})"]);
    }
}
