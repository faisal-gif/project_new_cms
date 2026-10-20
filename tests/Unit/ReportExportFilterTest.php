<?php

namespace Tests\Unit;

use App\Exports\NewsDaerahExport;
use App\Exports\NewsNasionalExport;
use App\Exports\TopCategoryNasionalExport;
use App\Exports\TopNewsNasionalExport;
use App\Models\NewsDaerah;
use App\Models\NewsNasional;
use Maatwebsite\Excel\Concerns\WithCustomQuerySize;
use Tests\TestCase;

/**
 * Setiap filter yang divalidasi controller harus benar-benar sampai ke SQL export.
 *
 * Dulu tidak: NewsNasionalExport diam-diam membuang filter editor dan TopNewsNasionalExport
 * membuang editor + tag, sementara nama berkasnya tetap menulis "editor-budi". Berkasnya
 * salah tanpa satu pun pesan error.
 *
 * Tes ini hanya membaca SQL, tidak mengeksekusinya — jadi tetap jalan saat mysql_daerah mati.
 */
class ReportExportFilterTest extends TestCase
{
    private const FILTER = [
        'start_date' => '2026-09-01',
        'end_date'   => '2026-09-30',
        'kanal'      => 3,
        'writer'     => 'Budi',
        'editor'     => 9,
        'tag'        => 11,
    ];

    public static function exportNasional(): array
    {
        $f = self::FILTER;

        return [
            'detail'    => [fn() => (new NewsNasionalExport($f))->query()],
            'top 50'    => [fn() => (new TopNewsNasionalExport($f))->baseQuery()],
            'top kanal' => [fn() => (new TopCategoryNasionalExport($f))->baseQuery()],
        ];
    }

    /** @dataProvider exportNasional */
    public function test_export_nasional_menerapkan_semua_filter(callable $buat): void
    {
        $sql = $buat()->toSql();

        $this->assertStringContainsString('`news`.`news_datepub` between', $sql);
        $this->assertStringContainsString('`news`.`catnews_id` =', $sql);
        $this->assertStringContainsString('`news`.`news_writer` =', $sql);
        $this->assertStringContainsString('`news`.`editor_id` =', $sql, 'filter editor hilang lagi');
        $this->assertStringContainsString('`news_tags`', $sql, 'filter tag hilang lagi');
    }

    public function test_export_daerah_menerapkan_semua_filter(): void
    {
        $sql = (new NewsDaerahExport(self::FILTER))->query()->toSql();

        $this->assertStringContainsString('`news`.`datepub` between', $sql);
        $this->assertStringContainsString('`news`.`cat_id` =', $sql);
        $this->assertStringContainsString('`news`.`writer_id` =', $sql);
        $this->assertStringContainsString('`news`.`editor_id` =', $sql);
    }

    /** Layar Report dan export detail harus menghasilkan SQL yang sama, bukan dua salinan. */
    public function test_layar_dan_export_memakai_filter_yang_sama(): void
    {
        $layar = NewsNasional::query()
            ->with(['kanal', 'writer', 'viewData'])
            ->filterLaporan(self::FILTER)
            ->orderBy('news_datepub', 'desc')
            ->toSql();

        $this->assertSame($layar, (new NewsNasionalExport(self::FILTER))->query()->toSql());
    }

    /** Dulu ada `where news_status = 1` tersembunyi di export, padahal layar menghitung semua status. */
    public function test_tanpa_filter_tidak_ada_where_tersembunyi(): void
    {
        $this->assertStringNotContainsString('where', NewsNasional::query()->filterLaporan([])->toSql());
        $this->assertStringNotContainsString('where', NewsDaerah::query()->filterLaporan([])->toSql());
        $this->assertStringNotContainsString('news_status', (new NewsNasionalExport([]))->query()->toSql());
        $this->assertStringNotContainsString('`status`', (new NewsDaerahExport([]))->query()->toSql());
    }

    /**
     * Export antrean memotong query dengan forPage(), yang menimpa ->limit() di query().
     * Cap 5.000 baris karena itu HARUS lewat querySize(), bukan ->limit().
     */
    public function test_batas_baris_dipasang_lewat_query_size(): void
    {
        foreach ([NewsNasionalExport::class, NewsDaerahExport::class] as $kelas) {
            $export = new $kelas(self::FILTER);

            $this->assertInstanceOf(WithCustomQuerySize::class, $export);
            $this->assertStringNotContainsString(
                'limit',
                $export->query()->toSql(),
                $kelas . ': ->limit() akan ditimpa forPage() sehingga cap tidak mengikat'
            );
        }
    }
}
