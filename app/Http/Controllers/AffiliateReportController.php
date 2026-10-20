<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliatePayout;
use App\Models\PaketBerita;
use App\Models\PaymentsNewsBerbayar;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Laporan program afiliasi. HANYA untuk CMS — pos 'internal' (staff IT) tidak pernah
 * boleh tampil di aplikasi publik, dan di dalam CMS pun dipagari izin tersendiri.
 *
 * Net kantor tidak pernah jadi baris komisi; dihitung sebagai
 * pemasukan kotor - total komisi keluar.
 */
class AffiliateReportController extends Controller
{
    use \App\Http\Controllers\Concerns\ScopesAffiliateSite;

    public function index(Request $request)
    {
        // Default: bulan berjalan. Zona waktu aplikasi sudah Asia/Jakarta, sama dengan
        // aplikasi publik — kalau berbeda, batas bulan akan meleset 7 jam.
        $awal = $request->filled('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : now()->startOfMonth();
        $akhir = $request->filled('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : now()->endOfMonth();

        // Situs dikunci route, bukan query string — lihat ScopesAffiliateSite.
        $situs = $this->situs($request);

        // Pos staff IT punya izin sendiri, terpisah dari izin melihat laporan.
        $bolehLihatStaffIt = (bool) $request->user()
            ?->can('view komisi staff it ' . $this->slugSitus($request));

        // Dipecah per situs langsung dari kolom `c.type` — tidak perlu join ke
        // payments dan news_package lagi.
        $perSitus = DB::connection('mysql_berbayar')
            ->table('affiliate_commissions as c')
            ->whereBetween('c.created_at', [$awal, $akhir])
            // rejected DAN reversed sama-sama dibatalkan sebelum uangnya berpindah.
            // Daftar ini harus sama dengan yang dipakai kolom "Komisi Keluar" di
            // daftar transaksi, kalau tidak net kantor di dua layar akan berbeda.
            ->whereNotIn('c.status', PaymentsNewsBerbayar::STATUS_KOMISI_KELUAR)
            ->where('c.type', $situs)
            ->groupBy('c.type')
            ->selectRaw("
                c.type situs,
                SUM(CASE WHEN c.role = 'tier1'    THEN c.amount ELSE 0 END) tier1,
                SUM(CASE WHEN c.role = 'tier2'    THEN c.amount ELSE 0 END) tier2,
                SUM(CASE WHEN c.role = 'internal' THEN c.amount ELSE 0 END) staff_it,
                SUM(CASE WHEN c.status = 'unassigned' THEN c.amount ELSE 0 END) tertahan,
                SUM(c.amount) total_keluar,
                COUNT(DISTINCT c.payment_id) jumlah_pembayaran
            ")->get();

        // Pemasukan kotor per situs — lewat scopeLunasPada(), definisi omzet yang
        // sama dengan laporan transaksi dan dashboard. Join ke news_package dibuang:
        // payments.type sudah membawa situsnya (0 beda dari 1.784 baris), dan tanpa
        // join itu pembayaran yang paketnya sudah terhapus tidak ikut lenyap.
        $kotorPerSitus = PaymentsNewsBerbayar::situs($situs)
            ->lunasPada($awal, $akhir)
            ->groupBy('type')
            ->selectRaw('type situs, SUM(amount) kotor')
            ->pluck('kotor', 'situs');

        // Gabungkan: situs yang punya pemasukan tapi nol komisi tetap harus muncul.
        $semuaSitus = $perSitus->pluck('situs')->merge($kotorPerSitus->keys())->unique();

        $baris = $semuaSitus->map(function ($situs) use ($perSitus, $kotorPerSitus, $bolehLihatStaffIt) {
            $r = $perSitus->firstWhere('situs', $situs);
            $kotor = (int) ($kotorPerSitus[$situs] ?? 0);
            $keluar = (int) ($r->total_keluar ?? 0);

            $row = [
                'situs' => $situs,
                'label' => PaketBerita::labelSitus($situs === null ? null : (string) $situs),
                'kotor' => $kotor,
                'tier1' => (int) ($r->tier1 ?? 0),
                'tier2' => (int) ($r->tier2 ?? 0),
                'tertahan' => (int) ($r->tertahan ?? 0),
                'jumlah_pembayaran' => (int) ($r->jumlah_pembayaran ?? 0),
            ];

            // Tiga angka ini hanya untuk pemegang izin staff IT. total_keluar dan
            // net_kantor ikut dipagari bukan karena sensitif sendiri, tapi karena
            // staff_it bisa dihitung ulang dari keduanya: keluar - tier1 - tier2.
            if ($bolehLihatStaffIt) {
                $row['staff_it'] = (int) ($r->staff_it ?? 0);
                $row['total_keluar'] = $keluar;
                $row['net_kantor'] = $kotor - $keluar;
            }

            return $row;
        })->sortByDesc('kotor')->values();

        // Baris total = jumlah seluruh situs, bukan query terpisah, supaya tidak mungkin
        // berbeda dari rinciannya.
        $kunci = ['kotor', 'tier1', 'tier2', 'tertahan', 'jumlah_pembayaran'];
        if ($bolehLihatStaffIt) {
            $kunci = array_merge($kunci, ['staff_it', 'total_keluar', 'net_kantor']);
        }
        $total = collect($kunci)->mapWithKeys(fn($k) => [$k => (int) $baris->sum($k)])->all();

        return Inertia::render('Admin/Affiliate/Report/Index', [
            'filters' => [
                'start_date' => $awal->toDateString(),
                'end_date' => $akhir->toDateString(),
                ],
            'situsLabel' => PaketBerita::labelSitus($situs),
            'routePrefix' => $this->prefixSitus($request),
            'bolehLihatStaffIt' => $bolehLihatStaffIt,
            'perSitus' => $baris,
            'rekap' => $total,
            'perAfiliator' => $this->perAfiliator($awal, $akhir, $situs),
            'invarian' => $this->periksaInvarian(),
        ]);
    }

    /**
     * Deteksi kecurangan sederhana. Bukan vonis — hanya daftar yang perlu dilihat manusia.
     *
     * Dua pola: banyak direkrut tapi hampir tak ada yang menulis, dan beberapa
     * pendaftaran dengan pola email mirip (bagian lokal sebelum '+' atau angka ekor sama).
     */
    public function fraud(Request $request)
    {
        $minDirekrut = (int) $request->get('min_direkrut', 3);

        $afiliator = Affiliate::where('type', $this->situs($request))
            ->withCount('referrals')
            ->having('referrals_count', '>=', $minDirekrut)
            ->orderByDesc('referrals_count')
            ->limit(100)
            ->get(['id', 'name', 'code', 'email', 'status']);

        $hasil = $afiliator->map(function ($a) {
            $userIds = DB::connection('mysql_berbayar')->table('affiliate_referrals')
                ->where('affiliate_id', $a->id)->pluck('user_id');

            if ($userIds->isEmpty()) {
                return null;
            }

            // Berapa dari member yang direkrut benar-benar pernah mengirim tulisan.
            $menulis = DB::connection('mysql_berbayar')->table('news')
                ->whereIn('pewarta_id', $userIds)->distinct()->count('pewarta_id');

            $emails = DB::connection('mysql_berbayar')->table('wartawan')
                ->whereIn('id', $userIds)->pluck('email')->filter();

            // Normalkan: buang titik, bagian setelah '+', dan angka di ekor nama.
            $pola = $emails->map(function ($e) {
                $lokal = strtolower(explode('@', $e)[0] ?? '');
                $lokal = explode('+', $lokal)[0];
                return rtrim(str_replace('.', '', $lokal), '0123456789');
            })->filter()->countBy();

            $miripTerbanyak = $pola->sortDesc()->first() ?? 0;

            return [
                'id' => $a->id,
                'name' => $a->name,
                'code' => $a->code,
                'status' => $a->status,
                'direkrut' => $userIds->count(),
                'menulis' => $menulis,
                'rasio_menulis' => $userIds->count() ? round($menulis / $userIds->count() * 100) : 0,
                'email_mirip' => $miripTerbanyak,
                'pola_mirip' => $miripTerbanyak >= 3 ? $pola->sortDesc()->keys()->first() : null,
            ];
        })->filter()
            // Hanya tampilkan yang benar-benar mencurigakan.
            ->filter(fn($r) => $r['rasio_menulis'] < 30 || $r['email_mirip'] >= 3)
            ->sortBy('rasio_menulis')
            ->values();

        return Inertia::render('Admin/Affiliate/Report/Fraud', [
            'rows' => $hasil,
            'filters' => ['min_direkrut' => $minDirekrut],
            'situsLabel' => $this->labelSitus($request),
            'routePrefix' => $this->prefixSitus($request),
        ]);
    }

    private function perAfiliator(Carbon $awal, Carbon $akhir, string $situs)
    {
        return AffiliateCommission::whereBetween('created_at', [$awal, $akhir])
            ->whereNotIn('status', PaymentsNewsBerbayar::STATUS_KOMISI_KELUAR)
            ->whereNotNull('affiliate_id')
            // Ikut filter situs supaya daftar ini konsisten dengan tabel di atasnya.
            ->where('type', $situs)
            ->selectRaw('affiliate_id, SUM(amount) total, COUNT(*) jumlah')
            ->groupBy('affiliate_id')
            ->orderByDesc('total')
            ->limit(25)
            ->with('affiliate:id,name,code')
            ->get()
            ->map(fn($r) => [
                'nama' => $r->affiliate?->name ?? '—',
                'kode' => $r->affiliate?->code ?? '—',
                'total' => (int) $r->total,
                'jumlah' => (int) $r->jumlah,
            ]);
    }

    /**
     * Dua invariant yang tidak dipaksakan database. Diperiksa tiap membuka laporan supaya
     * ketimpangan terlihat, bukan menunggu ada yang curiga.
     */
    private function periksaInvarian(): array
    {
        $totalTimpang = DB::connection('mysql_berbayar')->select("
            SELECT p.id, p.amount, COALESCE(SUM(c.amount), 0) jumlah_komisi
            FROM affiliate_payouts p
            LEFT JOIN affiliate_commissions c ON c.payout_id = p.id
            GROUP BY p.id, p.amount
            HAVING p.amount <> COALESCE(SUM(c.amount), 0)
        ");

        $batchCampur = DB::connection('mysql_berbayar')->select("
            SELECT payout_id, COUNT(DISTINCT affiliate_id) jumlah_afiliator
            FROM affiliate_commissions
            WHERE payout_id IS NOT NULL
            GROUP BY payout_id
            HAVING COUNT(DISTINCT affiliate_id) > 1
        ");

        return [
            'total_timpang' => array_map(fn($r) => (array) $r, $totalTimpang),
            'batch_campur' => array_map(fn($r) => (array) $r, $batchCampur),
        ];
    }
}
