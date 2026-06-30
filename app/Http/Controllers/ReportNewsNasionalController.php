<?php

namespace App\Http\Controllers;

use App\Exports\NewsNasionalExport;
use App\Models\EditorNasional;
use App\Models\KanalNasional;
use App\Models\NewsNasional;
use App\Models\User;
use App\Models\WriterNasional;
use App\Notifications\ExportReadyNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class ReportNewsNasionalController extends Controller
{
    // 1. PENTING: Jangan gunakan ->with() di sini agar query base-nya ringan
    private function buildQuery(Request $request)
    {
        $query = NewsNasional::query();

        // Karena kita sudah menyuntikkan nilai default di index(), 
        // blok ini akan selalu tereksekusi dengan aman.
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('news_datepub', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }


        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                // Gunakan ID agar query eksekusi lebih cepat pada relasi many-to-many
                $q->where('tags.id', $request->tag);
            });
        }

        if ($request->filled('kanal')) {
            $query->where('catnews_id', $request->kanal);
        }
        if ($request->filled('writer')) {
            $query->where('news_writer', $request->writer);
        }

        if ($request->filled('editor')) {
            $query->where('editor_id', $request->editor);
        }

        return $query;
    }

    public function index(Request $request)
    {
        // =========================================================
        // [OPTIMASI BARU]: Set Default "Bulan Ini" jika kosong
        // =========================================================
        if (!$request->filled('start_date') || !$request->filled('end_date')) {
            $request->merge([
                'start_date' => Carbon::now()->startOfMonth()->format('Y-m-d'),
                'end_date'   => Carbon::now()->endOfMonth()->format('Y-m-d'),
            ]);
        }

        // Sekarang, buildQuery akan memproses data berdasarkan bulan ini
        $baseQuery = $this->buildQuery($request);

        $totalNews = (clone $baseQuery)->count();
        $totalPublish = (clone $baseQuery)->where('news_status', 1)->count();
        $totalReview = (clone $baseQuery)->where('news_status', 2)->count();

        $totalViews = (clone $baseQuery)
            ->leftJoin('news_views', 'news.news_id', '=', 'news_views.news_id')
            ->sum('news_views.pageviews');

        $chartData = (clone $baseQuery)
            ->select(
                DB::raw('DATE(news.news_datepub) as date'),
                DB::raw('COUNT(news.news_id) as total_berita')
            )
            ->whereNotNull('news.news_datepub')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        $writers = WriterNasional::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => ['value' => $u->name, 'label' => $u->name]);

        $editors = EditorNasional::select('editor_id', 'editor_name')->where('status', '1')->get()
            ->map(fn($u) => ['value' => $u->editor_id, 'label' => $u->editor_name]);

        $kanals = KanalNasional::select('catnews_id', 'catnews_title')->get()
            ->map(fn($u) => ['value' => $u->catnews_id, 'label' => $u->catnews_title]);

        return Inertia::render('Admin/Nasional/News/Report/Index', [
            'summary' => [
                'total_news' => $totalNews,
                'total_publish' => $totalPublish,
                'total_review' => $totalReview,
                'total_views' => (int) $totalViews,
            ],
            'chart_data' => $chartData,
            'writers' => $writers,
            'editors' => $editors,
            'kanals' => $kanals,
            // Variabel 'filters' ini sekarang PASTI berisi tanggal bulan ini
            // sehingga React di sisi depan akan otomatis mengisi input kolom tanggal.
            'filters' => $request->only(['start_date', 'end_date', 'kanal', 'writer', 'editor']),
        ]);
    }

    // 2. Memproses Antrean Export Excel
    public function export(Request $request)
    {
        // 1. Validasi filter nasional
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'kanal'      => 'nullable',
            'writer'     => 'nullable',
            'tag'        => 'nullable',
        ]);

        // 2. Buat Array untuk merangkai nama file
        $nameParts = ['Laporan-Nasional'];

        // Tambahkan rentang tanggal 
        $nameParts[] = date('Ymd', strtotime($filters['start_date'])) . '-sd-' . date('Ymd', strtotime($filters['end_date']));

        // Cek dan tambahkan filter Kanal
        if (!empty($filters['kanal'])) {
            $nameParts[] = 'kanal-' . Str::slug($filters['kanal']);
        }

        // Cek dan tambahkan filter Writer
        if (!empty($filters['writer'])) {
            $writerName = WriterNasional::where('id', $filters['writer'])->value('name');

            if ($writerName) {
                $nameParts[] = Str::slug($writerName);
            } else {
                $nameParts[] = 'writer-' . $filters['writer'];
            }
        }

        // Gabungkan array menjadi satu string dan tambahkan Auth ID serta timestamp
        $fileName = implode('-', $nameParts) . '_' . Auth::id() . '_' . time() . '.xlsx';

        $userId = Auth::id();

        // 3. Queue dan simpan ke folder 'exports' di disk 'public'
        Excel::queue(
            new NewsNasionalExport($filters),
            'exports/' . $fileName,
            'public'
        )->chain([
            function () use ($userId, $fileName) {
                // 4. Cari User dan picu notifikasi real-time via WebSocket Reverb
                $user = User::find($userId);

                if ($user) {
                    $user->notify(new ExportReadyNotification($fileName));
                }
            }
        ]);

        return back()->with('success', 'Laporan Berita Nasional sedang diproses di belakang layar. Silakan cek lonceng notifikasi dalam beberapa saat.');
    }
}
