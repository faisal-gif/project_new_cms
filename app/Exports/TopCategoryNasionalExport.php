<?php

namespace App\Exports;

use App\Models\NewsNasional;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TopCategoryNasionalExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    use Exportable;

    protected $filters;
    protected $rowNumber = 0;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    /** Dipisah dari collection() supaya filternya bisa diperiksa tanpa koneksi DB. */
    public function baseQuery()
    {
        return NewsNasional::query()
            ->join('news_category', 'news.catnews_id', '=', 'news_category.catnews_id')
            ->leftJoin('news_views', 'news.news_id', '=', 'news_views.news_id')
            ->filterLaporan($this->filters)
            ->select(
                'news_category.catnews_title',
                DB::raw('COUNT(DISTINCT news.news_id) as total_berita'),
                DB::raw('SUM(COALESCE(news_views.pageviews, 0)) as total_views')
            )
            ->groupBy('news_category.catnews_id', 'news_category.catnews_title')
            ->orderByRaw('SUM(COALESCE(news_views.pageviews, 0)) DESC');
    }

    public function collection()
    {
        return $this->baseQuery()->get();
    }

    public function headings(): array
    {
        return ['No', 'Kanal', 'Jumlah Berita', 'Total Views', 'Rata-rata Views'];
    }

    public function map($row): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $row->catnews_title,
            (int) $row->total_berita,
            (int) $row->total_views,
            $row->total_berita > 0 ? round($row->total_views / $row->total_berita, 1) : 0,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}