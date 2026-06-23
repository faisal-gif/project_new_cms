<?php

namespace App\Exports;

use App\Models\NewsDaerah;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewsDaerahExport implements FromQuery, WithHeadings, WithMapping, ShouldQueue
{
    use Exportable;

    // Simpan filter dalam bentuk array biasa (mudah diserialisasi)
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        // 1. Inisialisasi Query dasar dengan Eager Loading
        $query = NewsDaerah::query()->with(['kanal:id,name', 'writer:id,name', 'editor:id,name']);

        // 2. Terapkan filter tanggal
        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('datepub', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay(),
            ])->where('status', 1);
        }

        // 3. Terapkan filter opsional lainnya
        if (!empty($this->filters['kanal'])) {
            $query->where('cat_id', $this->filters['kanal']);
        }
        if (!empty($this->filters['writer'])) {
            $query->where('writer_id', $this->filters['writer']);
        }

        if (!empty($this->filters['editor'])) {
            $query->where('editor_id', $this->filters['editor']);
        }

        // 4. Batasi maksimal 5000 data agar memory aman, dan urutkan
        return $query->limit(5000)->orderBy('datepub', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Judul Berita',
            'Penulis',
            'Editor',
            'Kanal',
            'Tanggal Publish',
            'Views',
            'Status',
        ];
    }

    public function map($news): array
    {
        $statusLabel = match ((int)$news->status) {
            0 => 'Pending',
            1 => 'Publish',
            2 => 'Review',
            3 => 'On Pro',
            default => 'Unknown'
        };

        return [
            $news->id,
            $news->title,
            $news->writer ? $news->writer->name : 'Unknown Writer',
            $news->editor ? $news->editor->name : 'Unknown Editor',
            $news->kanal ? $news->kanal->name : '-',
            Carbon::parse($news->datepub)->format('d-m-Y H:i'),
            $news->views ?? 0,
            $statusLabel,
        ];
    }
}
