<?php

namespace App\Exports;

use App\Models\NewsNasional;
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

class NewsNasionalExport implements FromQuery, WithHeadings, WithMapping, WithCustomQuerySize, ShouldQueue
{
    use Exportable;

    /** Batas baris; lihat querySize() soal kenapa tidak bisa dipasang sebagai ->limit(). */
    public const BATAS_BARIS = 5000;

    protected $filters;

    public function __construct(array $filters, protected ?int $userId = null, protected string $fileName = '')
    {
        $this->filters = $filters;
    }

    public function query()
    {
        // Filternya milik model (scopeFilterLaporan), sama persis dengan yang dipakai
        // layar Report. Jangan menyalinnya ke sini lagi — persis begitu filter editor
        // dulu hilang diam-diam dari export ini.
        return NewsNasional::query()
            ->with(['kanal', 'writer', 'viewData'])
            ->filterLaporan($this->filters)
            ->orderBy('news_datepub', 'desc');
    }

    /**
     * Export antrean memotong query dengan forPage(), yang MENIMPA ->limit() di query().
     * Jadi `->limit(5000)` yang dulu ada di sini tidak membatasi apa pun: jumlah potongan
     * dihitung dari count() penuh, dan seluruh baris tetap ditulis. Membatasi angka yang
     * dibaca pemotong adalah satu-satunya cara cap ini benar-benar mengikat.
     */
    public function querySize(): int
    {
        return min($this->query()->count(), self::BATAS_BARIS);
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
            3 => 'On Pro',
            default => 'Unknown'
        };

        // URL dari accessor NewsNasional (pakai catnews_slug asli). Jangan bangun dari
        // Str::slug(catnews_title) — untuk kanal Forum Dosen/Guru/Mahasiswa hasilnya beda.
        return [
            $news->news_id,
            $news->news_title,
            $news->writer ? $news->writer->name : ($news->news_writer ?? 'System'),
            $news->kanal ? $news->kanal->catnews_title : '-',
            $news->news_datepub ? Carbon::parse($news->news_datepub)->format('d-m-Y H:i') : '-',
            $news->viewData ? ($news->viewData->pageviews ?? 0) : 0,
            $statusLabel,
            $news->publicUrl ?? '-',
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
