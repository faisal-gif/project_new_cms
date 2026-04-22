<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Database\Eloquent\Builder;


class NewsDaerahExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    protected $query;

    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    public function query()
    {
        // Gunakan eager loading untuk optimasi query (N+1 Problem)
        return $this->query->orderBy('datepub', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Judul Berita',
            'Penulis',
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
            $news->writer->name,
            $news->kanal ? $news->kanal->name : '-',
            \Carbon\Carbon::parse($news->datepub)->format('d-m-Y H:i'),
            $news->views,
            $statusLabel,
        ];
    }
}
