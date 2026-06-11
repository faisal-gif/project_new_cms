<?php

namespace App\Http\Controllers;

use App\Enum\WriterBerbayarType;
use App\Models\WriterBerbayar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WriterAjpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
    {
        // 1. Ubah nama variabel menjadi jamak ($writers) karena ini adalah kumpulan data
        $writers = WriterBerbayar::query()
            // 2. Hindari "Magic Number". Gunakan Enum (direkomendasikan) 
            // Atau tetap gunakan ->where('type', 1) jika belum memakai Enum
            ->where('type', WriterBerbayarType::AJP->value) 
            
            // 3. Gunakan method when() untuk menggantikan blok if()
            ->when($request->search, function ($query, $search) {
                // Tidak perlu nested closure jika hanya mencari di satu kolom
                $query->where('nama', 'like', "%{$search}%");
            })
            
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            
            // 4. Gunakan helper method untuk urutan descending yang lebih ringkas
            ->orderByDesc('id') 
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AJP/Writer/Index', [
            'writers' => $writers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
