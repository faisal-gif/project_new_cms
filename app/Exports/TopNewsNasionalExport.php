<?php

namespace App\Exports;

use App\Models\NewsNasional;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TopNewsNasionalExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    use Exportable;

    protected array $filters;
    protected int $rank = 0;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    /**
     * Top 50 memakai scopeFilterLaporan yang sama dengan layar Report. Versi lama
     * menyalin filternya sendiri dan hanya menangani kanal + writer: pilih editor
     * atau tag di layar, berkasnya tetap berisi peringkat seluruh redaksi.
     */
    /** Dipisah dari collection() supaya filternya bisa diperiksa tanpa koneksi DB. */
    public function baseQuery()
    {
        return NewsNasional::query()
            ->join('news_views', 'news.news_id', '=', 'news_views.news_id')
            ->select('news.news_id', 'news.news_title', 'news.news_datepub', 'news.catnews_id', 'news_views.pageviews')
            ->with(['kanal'])
            ->filterLaporan($this->filters)
            ->orderBy('news_views.pageviews', 'DESC')
            ->limit(50);
    }

    public function collection()
    {
        return $this->baseQuery()->get();
    }

    public function headings(): array
    {
        return [
            'Peringkat',
            'Judul Berita',
            'Kanal',
            'Tanggal Publish',
            'Total Pageviews',
            'URL'
        ];
    }

    public function map($news): array
    {
        $this->rank++;

        // URL dari accessor NewsNasional (pakai catnews_slug asli), bukan slug dari judul kanal.
        $url = $news->publicUrl ?? '-';

        return [
            $this->rank,
            $news->news_title,
            $news->kanal ? $news->kanal->catnews_title : '-',
            Carbon::parse($news->news_datepub)->format('d/m/Y H:i'),
            (int) $news->pageviews,
            $url,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]], // Bold header
        ];
    }
}
