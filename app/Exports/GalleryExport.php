<?php

namespace App\Exports;

use App\Models\Gallery;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Contracts\Queue\ShouldQueue;

class GalleryExport implements FromQuery, WithHeadings, WithMapping, ShouldQueue
{
    use Exportable;

    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        // 1. [OPTIMASI]: Gunakan withCount('images') untuk mendapatkan kolom 'images_count' secara otomatis
        //    tanpa membebani memory server dengan meload seluruh baris tabel gambar.
        $query = Gallery::query()
            ->with(['kanal:id,title']) // Pastikan relasi 'kanal' sudah ada di Model Gallery Anda
            ->withCount('images');

        // 2. Terapkan filter tanggal (Berdasarkan gal_datepub)
        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('gal_datepub', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay(),
            ])->where('gal_status', 1); // Opsional: Hanya export yang Publish
        }

        // 3. Terapkan filter opsional lainnya
        if (!empty($this->filters['kanal'])) {
            $query->where('gal_catid', $this->filters['kanal']);
        }
        if (!empty($this->filters['fotografer'])) {
            $query->where('fotografer_id', $this->filters['fotografer']);
        }
        if (!empty($this->filters['editor'])) {
            $query->where('editor_id', $this->filters['editor']);
        }

        // 4. Batasi maksimal 5000 data agar memory Queue job Anda aman
        return $query->limit(5000)->orderBy('gal_datepub', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Judul Galeri',
            'Fotografer ID',
            'Editor ID',
            'Kanal',
            'Tanggal Publish',
            'Total Gambar', // <--- Headings baru
            'Views',
            'Status',
        ];
    }

    public function map($gallery): array
    {
        $statusLabel = match ((int)$gallery->gal_status) {
            0 => 'Pending',
            1 => 'Publish',
            2 => 'Review',
            3 => 'On Pro',
            default => 'Unknown'
        };

        return [
            $gallery->gal_id,
            $gallery->gal_title,
            // Jika Anda sudah mendaftarkan relasi fotografer() dan editor() di Model Gallery, 
            // Anda bisa mengubah ini menjadi $gallery->fotografer->name, dll.
            $gallery->fotografer_id, 
            $gallery->editor_id, 
            $gallery->kanal ? $gallery->kanal->title : '-',
            $gallery->gal_datepub ? Carbon::parse($gallery->gal_datepub)->format('d-m-Y H:i') : '-',
            
            // Kolom 'images_count' secara ajaib dibuat oleh metode withCount('images') dari kueri di atas.
            $gallery->images_count ?? 0, 
            
            $gallery->gal_view ?? 0,
            $statusLabel,
        ];
    }
}