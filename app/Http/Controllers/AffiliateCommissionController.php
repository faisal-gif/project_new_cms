<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\PaketBerita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Ledger komisi afiliasi.
 *
 * CMS HANYA boleh mengubah status, status_note, affiliate_id (khusus baris unassigned),
 * payout_id, approved_at, dan paid_at. Nominalnya ditulis sekali oleh aplikasi publik di
 * dalam transaksi pembayaran — koreksi dilakukan lewat status 'reversed', bukan mengedit amount.
 */
class AffiliateCommissionController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Affiliate/Commission/Index', [
            // append() di sini saja, bukan $appends global: layar pencairan tidak memuat
            // relasi payment.package, jadi accessor situs akan memicu N+1 di sana.
            'commissions' => $this->buildQuery($request)->latest('id')->paginate(25)->withQueryString()
                ->through(fn($c) => $c->append('situs')),
            'filters' => $request->only(['affiliate_id', 'status', 'role', 'situs', 'start_date', 'end_date']),
            'affiliates' => $this->opsiAfiliator(),
            'situsOptions' => PaketBerita::opsiSitus(),
            'ringkasan' => $this->ringkasan($request),
        ]);
    }

    /**
     * Baris tier2 tanpa upline. Uang ini belum jadi milik siapa pun — tanpa layar ini
     * tidak ada yang melihatnya.
     */
    public function unassigned(Request $request)
    {
        $query = AffiliateCommission::query()
            ->where('status', 'unassigned')
            ->with(['sourceAffiliate:id,name,code', 'user:id,nama,email', 'payment:id,reference,amount,paid_at'])
            ->latest('id');

        return Inertia::render('Admin/Affiliate/Commission/Unassigned', [
            'commissions' => $query->paginate(25)->withQueryString(),
            'affiliates' => $this->opsiAfiliator(),
            'total' => (int) AffiliateCommission::where('status', 'unassigned')->sum('amount'),
        ]);
    }

    /**
     * Setujui massal. Masa tahan 7 hari sudah terwujud sebagai available_at —
     * patuhi kolom itu, jangan hitung sendiri.
     */
    public function approve(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ], ['ids.required' => 'Pilih minimal satu baris komisi.']);

        $kandidat = AffiliateCommission::whereIn('id', $data['ids'])->get();

        $disetujui = 0;
        $ditolakTahan = 0;
        $ditolakStatus = 0;
        $ditolakTanpaPenerima = 0;

        foreach ($kandidat as $k) {
            if ($k->status !== 'accrued') {
                $ditolakStatus++;
                continue;
            }
            if (!$k->is_releasable) {
                $ditolakTahan++;
                continue;
            }
            // Baris tanpa penerima tidak boleh disetujui; tetapkan penerimanya dulu.
            if (!$k->affiliate_id) {
                $ditolakTanpaPenerima++;
                continue;
            }

            $k->update(['status' => 'approved', 'approved_at' => now()]);
            $disetujui++;
        }

        $pesan = "{$disetujui} komisi disetujui.";
        if ($ditolakTahan) $pesan .= " {$ditolakTahan} masih dalam masa tahan 7 hari.";
        if ($ditolakStatus) $pesan .= " {$ditolakStatus} statusnya bukan accrued.";
        if ($ditolakTanpaPenerima) $pesan .= " {$ditolakTanpaPenerima} belum punya penerima.";

        return back()->with($disetujui ? 'success' : 'error', $pesan);
    }

    /** Tolak — final, wajib beralasan. Dipakai untuk pendaftaran fiktif. */
    public function reject(Request $request, $id)
    {
        $data = $request->validate(
            ['status_note' => ['required', 'string', 'max:255']],
            ['status_note.required' => 'Alasan penolakan wajib diisi.']
        );

        $komisi = AffiliateCommission::findOrFail($id);

        if (!in_array($komisi->status, ['accrued', 'unassigned'], true)) {
            return back()->withErrors(['error' => 'Hanya komisi accrued atau unassigned yang bisa ditolak.']);
        }

        $komisi->update(['status' => 'rejected', 'status_note' => $data['status_note']]);

        return back()->with('success', 'Komisi ditolak.');
    }

    /** Balikkan — hanya dari approved atau paid, dipakai saat refund/chargeback. */
    public function reverse(Request $request, $id)
    {
        $data = $request->validate(
            ['status_note' => ['required', 'string', 'max:255']],
            ['status_note.required' => 'Alasan pembalikan wajib diisi.']
        );

        $komisi = AffiliateCommission::findOrFail($id);

        if (!in_array($komisi->status, ['approved', 'paid'], true)) {
            return back()->withErrors(['error' => 'Hanya komisi approved atau paid yang bisa dibalik.']);
        }

        $komisi->update(['status' => 'reversed', 'status_note' => $data['status_note']]);

        return back()->with('success', 'Komisi dibalik (reversed).');
    }

    /** Tetapkan penerima untuk baris unassigned, lalu baris itu boleh disetujui. */
    public function assign(Request $request, $id)
    {
        $data = $request->validate([
            'affiliate_id' => ['required', 'integer', Rule::exists('mysql_berbayar.affiliates', 'id')],
        ], ['affiliate_id.required' => 'Penerima wajib dipilih.']);

        $komisi = AffiliateCommission::findOrFail($id);

        if ($komisi->status !== 'unassigned') {
            return back()->withErrors(['error' => 'Hanya baris unassigned yang bisa ditetapkan penerimanya.']);
        }

        // Setelah penerima ditetapkan, baris masuk alur normal: accrued -> approved.
        $komisi->update(['affiliate_id' => $data['affiliate_id'], 'status' => 'accrued']);

        return back()->with('success', 'Penerima ditetapkan. Baris kini menunggu persetujuan.');
    }

    private function buildQuery(Request $request)
    {
        return AffiliateCommission::query()
            ->with([
                'affiliate:id,name,code',
                'sourceAffiliate:id,name,code',
                'user:id,nama,email',
                'payment:id,reference,package_id,amount,paid_at',
                // type = penanda situs asal komisi (AJP / Kopi TIMES / dst).
                'payment.package:id,name,type',
            ])
            ->when($request->filled('affiliate_id'), fn($q) => $q->where('affiliate_id', $request->affiliate_id))
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('role'), fn($q) => $q->where('role', $request->role))
            // Situs tidak ada di tabel komisi; disaring lewat rantai payment -> package.
            ->when($request->filled('situs'), fn($q) => $q->whereHas(
                'payment.package',
                fn($p) => $p->where('type', $request->situs)
            ))
            ->when($request->filled('start_date'), fn($q) => $q->whereDate('created_at', '>=', $request->start_date))
            ->when($request->filled('end_date'), fn($q) => $q->whereDate('created_at', '<=', $request->end_date));
    }

    /** Ringkasan mengikuti filter yang sedang aktif, bukan seluruh tabel. */
    private function ringkasan(Request $request): array
    {
        $r = $this->buildQuery($request)
            ->selectRaw("
                SUM(CASE WHEN status = 'accrued'    THEN amount ELSE 0 END) accrued,
                SUM(CASE WHEN status = 'approved'   THEN amount ELSE 0 END) approved,
                SUM(CASE WHEN status = 'paid'       THEN amount ELSE 0 END) paid,
                SUM(CASE WHEN status = 'unassigned' THEN amount ELSE 0 END) unassigned,
                COUNT(*) jumlah
            ")->first();

        return [
            'accrued' => (int) ($r->accrued ?? 0),
            'approved' => (int) ($r->approved ?? 0),
            'paid' => (int) ($r->paid ?? 0),
            'unassigned' => (int) ($r->unassigned ?? 0),
            'jumlah' => (int) ($r->jumlah ?? 0),
        ];
    }

    private function opsiAfiliator()
    {
        return Affiliate::orderBy('name')->get(['id', 'name', 'code'])
            ->map(fn($a) => ['value' => $a->id, 'label' => "{$a->name} ({$a->code})"]);
    }
}
