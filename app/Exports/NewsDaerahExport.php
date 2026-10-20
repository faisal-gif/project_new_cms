<?php

namespace App\Exports;

use App\Models\NewsDaerah;
use App\Models\User;
use App\Notifications\ExportFailedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithCustomQuerySize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Throwable;

class NewsDaerahExport implements FromQuery, WithHeadings, WithMapping, WithCustomQuerySize, ShouldQueue
{
    use Exportable;

    public const BATAS_BARIS = 5000;

    protected $filters;

    public function __construct(array $filters, protected ?int $userId = null, protected string $fileName = '')
    {
        $this->filters = $filters;
    }

    public function query()
    {
        return NewsDaerah::query()
            ->with(['kanal:id,name', 'writer:id,name', 'editor:id,name'])
            ->filterLaporan($this->filters)
            ->orderBy('datepub', 'desc');
    }

    /** forPage() menimpa ->limit(); lihat NewsNasionalExport::querySize(). */
    public function querySize(): int
    {
        return min($this->query()->count(), self::BATAS_BARIS);
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
            $news->datepub ? Carbon::parse($news->datepub)->format('d-m-Y H:i') : '-',
            $news->views ?? 0,
            $statusLabel,
        ];
    }

    /**
     * Dipanggil maatwebsite (QueueExport/AppendQueryToSheet/CloseSheet) saat job mati.
     * Tanpa ini pengguna tidak pernah tahu bedanya export gagal dengan antrean lambat:
     * lonceng sama-sama diam.
     */
    public function failed(Throwable $e): void
    {
        Log::error('Export laporan gagal: ' . $e->getMessage(), ['file' => $this->fileName]);

        if ($this->userId && $user = User::find($this->userId)) {
            $user->notify(new ExportFailedNotification($this->fileName));
        }
    }
}
