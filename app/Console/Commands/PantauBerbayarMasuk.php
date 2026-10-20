<?php

namespace App\Console\Commands;

use App\Models\MerchandiseShipment;
use App\Models\NewsBerbayar;
use App\Models\PaketBerita;
use App\Models\User;
use App\Notifications\BeritaBerbayarMasukNotification;
use App\Notifications\PesananMerchandiseMasukNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Memantau dua hal yang masuk ke mysql_berbayar dari aplikasi publik:
 * berita berstatus Pending yang menunggu disunting, dan pesanan merchandise.
 *
 * Kenapa polling dan bukan event di controller: CMS bukan penulis barisnya.
 * 1.871 dari 1.890 berita pending punya created_by NULL — ditulis aplikasi publik
 * langsung ke database bersama, tanpa pernah melewati satu pun route CMS.
 */
class PantauBerbayarMasuk extends Command
{
    protected $signature = 'berbayar:pantau-masuk {--situs= : 1 (AJP) atau 4 (Kopi TIMES); kosong = keduanya}';

    protected $description = 'Kirim notifikasi untuk berita Pending dan pesanan merchandise baru di AJP / Kopi TIMES';

    /** Jangan pernah kirim lebih dari ini sekali jalan — satu impor massal tidak boleh membanjiri lonceng. */
    private const MAKS_SEKALI = 20;

    /**
     * Izin penerima notifikasi: terpisah per ALIRAN dan per SITUS, jadi redaksi
     * bisa dapat notifikasi berita tanpa ikut kebanjiran pesanan kaos, dan
     * sebaliknya. Empat nama yang terbentuk:
     *
     *   terima notifikasi berita ajp          terima notifikasi berita kopi-times
     *   terima notifikasi merchandise ajp     terima notifikasi merchandise kopi-times
     *
     * Kata 'terima' dipilih dengan sengaja. EnforceRoutePermission hanya pernah
     * menyusun nama izin sebagai "{view|create|edit|delete} {resource}", jadi izin
     * berawalan 'terima' mustahil ikut menggerbangi route mana pun. Memakai nama
     * seperti 'edit news ajp' justru akan MENGAKTIFKAN gerbang di layar AJP yang
     * hari ini fail-open, dan mengunci semua orang kecuali super-admin.
     */
    private const IZIN_PENERIMA = 'terima notifikasi ';

    /** Bangun nama izin untuk satu aliran di satu situs. */
    private function izin(string $aliran, string $situs): string
    {
        return self::IZIN_PENERIMA . $aliran . ' ' . self::SLUG[$situs];
    }

    /** slug route per situs; dipakai menyusun tautan. */
    private const SLUG = ['1' => 'ajp', '4' => 'kopi-times'];

    public function handle(): int
    {
        $situsDiminta = $this->option('situs');
        $daftar = $situsDiminta ? [$situsDiminta] : array_keys(self::SLUG);

        foreach ($daftar as $situs) {
            if (! isset(self::SLUG[$situs])) {
                $this->error("Situs tidak dikenal: {$situs}");

                return self::FAILURE;
            }

            $this->pantauBerita((string) $situs);
            $this->pantauMerchandise((string) $situs);
        }

        return self::SUCCESS;
    }

    private function pantauBerita(string $situs): void
    {
        $this->proses(
            kunci: "berbayar:watermark:news:{$situs}",
            judulAliran: 'Berita ' . PaketBerita::labelSitus($situs),
            izin: $this->izin('berita', $situs),
            baris: fn($sesudah) => NewsBerbayar::where('type', $situs)
                ->where('status', 0)
                ->where('id', '>', $sesudah)
                ->orderBy('id')
                ->limit(self::MAKS_SEKALI)
                ->get(['id', 'title', 'pewarta_id']),
            maksId: fn() => (int) NewsBerbayar::where('type', $situs)->max('id'),
            jadiNotifikasi: fn($n) => new BeritaBerbayarMasukNotification(
                PaketBerita::labelSitus($situs),
                (int) $n->id,
                (string) $n->title,
                $this->namaPewarta($n->pewarta_id),
                $this->tautan(self::SLUG[$situs] . '.news.edit', $n->id),
            ),
        );
    }

    private function pantauMerchandise(string $situs): void
    {
        $this->proses(
            kunci: "berbayar:watermark:merch:{$situs}",
            judulAliran: 'Merchandise ' . PaketBerita::labelSitus($situs),
            izin: $this->izin('merchandise', $situs),
            baris: fn($sesudah) => MerchandiseShipment::where('type', $situs)
                ->where('id', '>', $sesudah)
                ->orderBy('id')
                ->limit(self::MAKS_SEKALI)
                ->get(['id', 'item_name', 'user_id']),
            maksId: fn() => (int) MerchandiseShipment::where('type', $situs)->max('id'),
            jadiNotifikasi: fn($m) => new PesananMerchandiseMasukNotification(
                PaketBerita::labelSitus($situs),
                (int) $m->id,
                (string) $m->item_name,
                $this->namaPewarta($m->user_id),
                $this->tautan(self::SLUG[$situs] . '.shipments.index'),
            ),
        );
    }

    /**
     * Satu aliran: ambil baris baru setelah watermark, kirim, majukan watermark.
     *
     * Jalan pertama kali SENGAJA tidak mengirim apa pun — hanya menandai posisi saat ini.
     * Tanpa itu, pemasangan perdana akan meledakkan 1.890 notifikasi berita lama sekaligus.
     */
    private function proses(
        string $kunci,
        string $judulAliran,
        string $izin,
        callable $baris,
        callable $maksId,
        callable $jadiNotifikasi,
    ): void {
        $watermark = Cache::get($kunci);

        if ($watermark === null) {
            $awal = $maksId();
            Cache::forever($kunci, $awal);
            $this->info("{$judulAliran}: pemasangan awal, watermark disetel ke #{$awal} (tidak ada notifikasi dikirim).");

            return;
        }

        $baru = $baris((int) $watermark);

        if ($baru->isEmpty()) {
            $this->line("{$judulAliran}: tidak ada yang baru.");

            return;
        }

        $penerima = User::permission($izin)->get();

        // Penerima kosong = notifikasi menguap tanpa jejak. Watermark TIDAK dimajukan
        // supaya barisnya terkirim pada putaran berikutnya, bukan hilang diam-diam.
        if ($penerima->isEmpty()) {
            $pesan = "{$judulAliran}: {$baru->count()} baris baru TIDAK terkirim — tidak ada user dengan izin '{$izin}'.";
            $this->warn($pesan);
            Log::warning($pesan);

            return;
        }

        foreach ($baru as $row) {
            Notification::send($penerima, $jadiNotifikasi($row));
        }

        Cache::forever($kunci, (int) $baru->last()->id);
        $this->info("{$judulAliran}: {$baru->count()} notifikasi ke {$penerima->count()} user, watermark -> #{$baru->last()->id}.");
    }

    private function namaPewarta($id): string
    {
        if (blank($id)) {
            return 'Tanpa nama';
        }

        return Cache::remember("berbayar:nama-pewarta:{$id}", now()->addHour(), function () use ($id) {
            $w = \App\Models\WriterBerbayar::find($id);

            return $w?->nama ?: $w?->name ?: ('Pewarta #' . $id);
        });
    }

    /** Route situs yang belum punya layar CMS (mis. merchandise AJP) -> tautan null, bukan error. */
    private function tautan(string $nama, $param = null): ?string
    {
        $penuh = 'admin.' . $nama;

        if (! app('router')->has($penuh)) {
            return null;
        }

        return $param === null ? route($penuh) : route($penuh, $param);
    }
}
