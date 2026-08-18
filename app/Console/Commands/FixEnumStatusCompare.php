<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Finder\Finder;

class FixEnumStatusCompare extends Command
{
    protected $signature = 'fix:network-status
                            {--path=app : Folder yang discan (relatif ke base path)}
                            {--apply : Tulis perubahan (default: dry-run)}
                            {--self-check : Uji logika transform lalu keluar}';

    protected $description = "Ubah perbandingan where('network.status', 1) yang memakai integer menjadi string ('1'). "
        . 'Khusus kolom status milik NETWORK — kolom ENUM di MySQL menafsirkan int sebagai indeks, bukan nilai.';

    public function handle(): int
    {
        if ($this->option('self-check')) {
            return $this->selfCheck();
        }

        $apply = (bool) $this->option('apply');
        $base = base_path($this->option('path'));

        if (! is_dir($base)) {
            $this->error("Folder tidak ditemukan: {$base}");
            return self::FAILURE;
        }

        $finder = (new Finder())->files()->in($base)->name('*.php');

        $rows = [];
        $filesChanged = 0;
        $totalHits = 0;

        foreach ($finder as $file) {
            // Lewati file command ini sendiri (berisi fixture self-check, bukan query asli).
            if ($file->getRealPath() === __FILE__) {
                continue;
            }

            $lines = explode("\n", $file->getContents());
            $fileHits = 0;

            foreach ($lines as $i => $line) {
                $new = self::fixLine($line);
                if ($new !== $line) {
                    $rel = str_replace(base_path() . DIRECTORY_SEPARATOR, '', $file->getRealPath());
                    $rows[] = [$rel, $i + 1, trim($line), trim($new)];
                    $lines[$i] = $new;
                    $fileHits++;
                    $totalHits++;
                }
            }

            if ($fileHits > 0) {
                $filesChanged++;
                if ($apply) {
                    file_put_contents($file->getRealPath(), implode("\n", $lines));
                }
            }
        }

        if ($totalHits === 0) {
            $this->info('Tidak ada perbandingan network.status berbentuk integer. Bersih (sudah pakai string).');
            return self::SUCCESS;
        }

        $this->table(['File', 'Baris', 'Sebelum', 'Sesudah'], $rows);
        $verb = $apply ? "diubah di {$filesChanged} file" : 'akan diubah (dry-run)';
        $this->info("{$totalHits} perbandingan {$verb}.");

        if (! $apply) {
            $this->line('Jalankan lagi dengan --apply untuk menyimpan.');
        }

        return self::SUCCESS;
    }

    /**
     * Ubah literal integer menjadi string pada where('...network...status', N) di satu baris.
     * HANYA kolom yang mengandung "network" — kolom status lain tidak disentuh.
     * Mendukung bentuk 2-argumen dan 3-argumen (dengan operator).
     */
    public static function fixLine(string $line): string
    {
        // 3-arg: where('network.status', '=', 1) -> ... '1')
        $line = preg_replace_callback(
            '/(->(?:orWhere|where)\(\s*[\'"][\w.]*network[\w.]*status[\'"]\s*,\s*[\'"](?:=|!=|<>|<=|>=)[\'"]\s*,\s*)(\d+)(\s*\))/i',
            fn ($m) => $m[1] . "'" . $m[2] . "'" . $m[3],
            $line
        );

        // 2-arg: where('network.status', 1) -> where('network.status', '1')
        $line = preg_replace_callback(
            '/(->(?:orWhere|where)\(\s*[\'"][\w.]*network[\w.]*status[\'"]\s*,\s*)(\d+)(\s*\))/i',
            fn ($m) => $m[1] . "'" . $m[2] . "'" . $m[3],
            $line
        );

        return $line;
    }

    private function selfCheck(): int
    {
        $cases = [
            // network -> diubah
            ["\$q->where('network.status', 1)", "\$q->where('network.status', '1')"],
            ["->orWhere('networks.status', 0)", "->orWhere('networks.status', '0')"],
            ["->where('network.status', '=', 1)", "->where('network.status', '=', '1')"],
            // BUKAN network -> tidak diubah
            ["->where('status', 1)", "->where('status', 1)"],
            ["->where('is_status', 1)", "->where('is_status', 1)"],
            ["->where('news_status', 2)", "->where('news_status', 2)"],
            // sudah string / variabel -> tidak diubah
            ["->where('network.status', '1')", "->where('network.status', '1')"],
            ["->where('network.status', \$request->status)", "->where('network.status', \$request->status)"],
        ];
        foreach ($cases as [$in, $want]) {
            $got = self::fixLine($in);
            if ($got !== $want) {
                $this->error("FAIL: [{$in}] => [{$got}] (harus [{$want}])");
                return self::FAILURE;
            }
        }
        $this->info('Self-check OK (' . count($cases) . ' kasus).');
        return self::SUCCESS;
    }
}
