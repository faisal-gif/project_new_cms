<?php

namespace App\Http\Controllers;

use App\Http\Requests\KanalNasionalFormRequest;
use App\Models\KanalNasional;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanalNasionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = KanalNasional::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('catnews_title', 'like', "%{$request->search}%")
                    ->orWhere('catnews_slug', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('catnews_status', $request->status);
        }
        $kanal = $query->orderBy('catnews_order', 'asc')
            ->paginate(10)
            ->withQueryString();


        return Inertia::render('Admin/Nasional/Kanal/Index', [
            'kanal'   => $kanal,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Nasional/Kanal/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(KanalNasionalFormRequest $request)
    {
        $kanalNasional = KanalNasional::create([
            'catnews_order' => $request->order,
            'catnews_title' => $request->name,
            'catnews_slug' => $request->slug,
            'catnews_description' => $request->description,
            'catnews_keyword' => $request->keyword,
            'catnews_status' => $request->status,
        ]);

        return redirect()->route('admin.nasional.kanal.index')->with('success', 'Kanal Berhasil Ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(KanalNasional $kanalNasioanl) {}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($kanalNasioanl)
    {

        $kanal = KanalNasional::find($kanalNasioanl);


        return Inertia::render('Admin/Nasional/Kanal/Edit', [
            'kanal' => $kanal,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(KanalNasionalFormRequest $request, $kanalNasioanl)
    {
        $kanal = KanalNasional::find($kanalNasioanl);

        $kanal->catnews_order = $request->input('order');
        $kanal->catnews_title  = $request->input('name');
        $kanal->catnews_slug = $request->input('slug');
        $kanal->catnews_keyword = $request->input('keyword');
        $kanal->catnews_description = $request->input('description');
        $kanal->catnews_status  = $request->input('status');
        $kanal->save();

        return redirect()->route('admin.nasional.kanal.index')->with('success', 'Kanal Berhasil Diubah');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KanalNasional $kanalNasioanl)
    {
        //
    }
}
