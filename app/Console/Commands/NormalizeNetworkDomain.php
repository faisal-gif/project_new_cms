<?php

namespace App\Console\Commands;

use App\Models\NetworkDaerah;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class NormalizeNetworkDomain extends Command
{
    protected $signature = 'network:normalize-domain
                            {--apply : Simpan perubahan (default: dry-run, hanya menampilkan)}
                            {--self-check : Jalankan uji logika transform lalu keluar}';

    protected $description = 'Ubah domain network dari format lama (pasamantimes.com) ke baru (pasaman.times.co.id). Idempotent untuk yang sudah baru.';

    public function handle(): int
    {
        if ($this->option('self-check')) {
            return $this->selfCheck();
        }

        $apply = (bool) $this->option('apply');
        $networks = NetworkDaerah::query()->orderBy('id')->get(['id', 'name', 'domain']);

        $rows = [];
        $toUpdate = [];   // id => newDomain
        $changed = 0;
        $skipped = 0;

        // Domain yang TIDAK berubah (sudah baru / tak dikenal) — untuk deteksi tabrakan.
        $unchanged = [];
        foreach ($networks as $n) {
            if (self::normalizeDomain($n->domain) === null) {
                $unchanged[strtolower(trim((string) $n->domain))] = $n->id;
            }
        }

        $targets = []; // newDomain => id pertama yang memakainya
        foreach ($networks as $n) {
            $new = self::normalizeDomain($n->domain);

            if ($new === null) {
                $status = str_ends_with(strtolower(trim((string) $n->domain)), '.times.co.id')
                    ? 'sudah baru'
                    : 'dilewati (pola tak dikenal)';
                $rows[] = [$n->id, $n->domain, '—', $status];
                $skipped++;
                continue;
            }

            // Deteksi tabrakan: target sama dengan domain lain yang tidak berubah, atau dengan target lain.
            $collision = null;
            if (isset($unchanged[$new])) {
                $collision = "bentrok dgn network #{$unchanged[$new]}";
            } elseif (isset($targets[$new])) {
                $collision = "bentrok dgn network #{$targets[$new]}";
            }

            if ($collision) {
                $rows[] = [$n->id, $n->domain, $new, "DILEWATI: {$collision}"];
                $skipped++;
                continue;
            }

            $targets[$new] = $n->id;
            $toUpdate[$n->id] = $new;
            $rows[] = [$n->id, $n->domain, $new, $apply ? 'akan diubah' : 'preview'];
            $changed++;
        }

        $this->table(['ID', 'Domain lama', 'Domain baru', 'Status'], $rows);

        if (! $apply) {
            $this->info("DRY RUN — {$changed} akan diubah, {$skipped} dilewati.");
            $this->line('Jalankan lagi dengan --apply untuk menyimpan.');
            return self::SUCCESS;
        }

        if ($changed === 0) {
            $this->info('Tidak ada yang perlu diubah.');
            return self::SUCCESS;
        }

        DB::connection('mysql_daerah')->transaction(function () use ($toUpdate) {
            foreach ($toUpdate as $id => $new) {
                NetworkDaerah::where('id', $id)->update(['domain' => $new]);
            }
        });

        $this->info("Selesai — {$changed} domain diperbarui, {$skipped} dilewati.");
        return self::SUCCESS;
    }

    /**
     * Ubah domain lama '<slug>times.com' → '<slug>.times.co.id'.
     * Kembalikan null bila sudah format baru atau polanya tak dikenal (jangan ditebak).
     */
    public static function normalizeDomain(?string $domain): ?string
    {
        $d = strtolower(trim((string) $domain));
        if ($d === '') {
            return null;
        }
        if (str_ends_with($d, '.times.co.id')) {
            return null; // sudah format baru
        }
        if (str_ends_with($d, 'times.com')) {
            $slug = rtrim(substr($d, 0, -strlen('times.com')), '.-');
            return $slug === '' ? null : $slug . '.times.co.id';
        }
        return null; // pola tak dikenal
    }

    private function selfCheck(): int
    {
        $cases = [
            ['pasamantimes.com', 'pasaman.times.co.id'],
            ['sumseltimes.com', 'sumsel.times.co.id'],
            ['JatimTimes.com', 'jatim.times.co.id'], // case-insensitive
            ['sumsel.times.co.id', null],            // sudah baru → skip
            ['pasaman.times.co.id', null],
            ['contoh.org', null],                    // pola lain → skip
            ['', null],
        ];
        foreach ($cases as [$in, $want]) {
            $got = self::normalizeDomain($in);
            if ($got !== $want) {
                $this->error(sprintf('FAIL: %s => %s (harus %s)', var_export($in, true), var_export($got, true), var_export($want, true)));
                return self::FAILURE;
            }
        }
        $this->info('Self-check OK (' . count($cases) . ' kasus).');
        return self::SUCCESS;
    }
}
