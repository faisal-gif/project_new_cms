<?php

namespace App\Exports;

use App\Models\NewsNasional;
use Carbon\Carbon;
use Illuminate\Support\Str;
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
     * Eksekusi query agregasi di level MySQL
     */
    public function collection()
    {
        $query = NewsNasional::query()
            ->join('news_views', 'news.news_id', '=', 'news_views.news_id')
            ->select('news.news_id', 'news.news_title', 'news.news_datepub', 'news.catnews_id', 'news_views.pageviews')
            ->with(['kanal']); // Hindari N+1 query untuk relasi

        // Terapkan Filter Tanggal
        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('news.news_datepub', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay(),
            ])->where('news.news_status', 1); // Hanya berita yang sudah publish
        }

        // Terapkan Filter Lain (Opsional, sesuai input React)
        if (!empty($this->filters['kanal'])) $query->where('news.catnews_id', $this->filters['kanal']);
        if (!empty($this->filters['writer'])) $query->where('news.news_writer', $this->filters['writer']);

        // Ambil TOP 50 Berita Berdasarkan Views
        // Karena datanya dibatasi (limit), ini sangat aman dan tidak butuh sistem Queue yang rumit.
        return $query->orderBy('news_views.pageviews', 'DESC')->limit(50)->get();
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

        $kanalSlug = $news->kanal ? Str::slug($news->kanal->catnews_title) : 'uncategorized';
        $titleSlug = Str::slug($news->news_title);
        $url = "https://timesindonesia.co.id/{$kanalSlug}/{$news->news_id}/{$titleSlug}";

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
