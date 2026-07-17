<?php

namespace App\Exports;

use App\Models\NewsNasional;
use Carbon\Carbon;
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

    public function collection()
    {
        $query = NewsNasional::query()
            ->join('news_category', 'news.catnews_id', '=', 'news_category.catnews_id')
            ->leftJoin('news_views', 'news.news_id', '=', 'news_views.news_id')
            ->whereBetween('news.news_datepub', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay(),
            ]);

        if (!empty($this->filters['kanal'])) {
            $query->where('news.catnews_id', $this->filters['kanal']);
        }

        if (!empty($this->filters['writer'])) {
            $query->where('news.news_writer', $this->filters['writer']);
        }

        if (!empty($this->filters['editor'])) {
            $query->where('news.editor_id', $this->filters['editor']);
        }

        if (!empty($this->filters['tag'])) {
            $tagId = $this->filters['tag'];
            $query->whereHas('tags', fn($q) => $q->where('tags.id', $tagId));
        }

        return $query
            ->select(
                'news_category.catnews_title',
                DB::raw('COUNT(DISTINCT news.news_id) as total_berita'),
                DB::raw('SUM(COALESCE(news_views.pageviews, 0)) as total_views')
            )
            ->groupBy('news_category.catnews_id', 'news_category.catnews_title')
            ->orderByRaw('SUM(COALESCE(news_views.pageviews, 0)) DESC')
            ->get();
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