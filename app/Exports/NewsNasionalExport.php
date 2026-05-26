<?php

namespace App\Exports;

use App\Models\NewsNasional;
use Carbon\Carbon;
use Illuminate\Support\Str; // <-- 1. Tambahkan import helper Str
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewsNasionalExport implements FromQuery, WithHeadings, WithMapping, ShouldQueue
{
    use Exportable;

    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = NewsNasional::query()->with(['kanal', 'writer', 'viewData']);

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('news_datepub', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay(),
            ])->where('news_status', 1);
        }

        if (!empty($this->filters['kanal'])) {
            $query->where('catnews_id', $this->filters['kanal']);
        }
        if (!empty($this->filters['writer'])) {
            $query->where('news_writer', $this->filters['writer']);
        }

        return $query->limit(5000)->orderBy('news_datepub', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID Berita',
            'Judul Berita',
            'Penulis',
            'Kanal',
            'Tanggal Publish',
            'Pageviews',
            'Status',
            'URL Berita', 
        ];
    }

    public function map($news): array
    {
        $statusLabel = match ((int)$news->news_status) {
            0 => 'Pending',
            1 => 'Publish',
            2 => 'Review',
            default => 'Unknown'
        };

        // 3. Bangun URL secara dinamis
        // Jika tabel Anda sudah memiliki kolom slug asli (misal: news_slug atau catnews_slug),
        // Anda bisa langsung memanggil kolom tersebut daripada menggunakan Str::slug()
        $kanalSlug = $news->kanal ? Str::slug($news->kanal->catnews_title) : 'uncategorized';
        $titleSlug = Str::slug($news->news_title);
        
        $urlBerita = "https://timesindonesia.co.id/{$kanalSlug}/{$news->news_id}/{$titleSlug}";

        return [
            $news->news_id,
            $news->news_title,
            $news->writer ? $news->writer->name : ($news->news_writer ?? 'System'),
            $news->kanal ? $news->kanal->catnews_title : '-',
            Carbon::parse($news->news_datepub)->format('d-m-Y H:i'),
            $news->viewData ? ($news->viewData->pageviews ?? 0) : 0,
            $statusLabel,
            $urlBerita, 
        ];
    }
}