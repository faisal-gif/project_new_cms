<?php

namespace App\Http\Controllers;

use App\Models\NewsBerbayar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsAJPController extends Controller
{
    public function index(Request $request)
    {
        $news = NewsBerbayar::query()
            ->with('writer:id,nama')
            ->where('type', '1')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('is_code', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            // Urutkan berdasarkan waktu tayang (datetime) terbaru
            ->orderByDesc('datetime')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AJP/News/Index', [
            'news'    => $news,
            'filters' => $request->only(['search', 'status']),
        ]);
    }
}
