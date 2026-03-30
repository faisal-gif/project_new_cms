<?php

namespace App\Http\Controllers;

use App\Http\Requests\FokusNasionalFormRequest;
use App\Models\FokusNasional;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FokusNasionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FokusNasional::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('focnews_title', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $focus = $query->orderBy('focnews_id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Nasional/Focus/Index', [
            'focus'   => $focus,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Nasional/Focus/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FokusNasionalFormRequest $request)
    {
        $fokus = FokusNasional::create([
            'focnews_title' => $request->name,
            'focnews_description' => $request->description,
            'focnews_keyword' => $request->keyword,
            'status' => $request->status,
            'focnews_image_body' => $request->img_desktop_list,
            'focnews_image_news' => $request->img_desktop_news,
            'focnews_image_mobile' => $request->img_mobile,
        ]);

        return redirect()->route('admin.nasional.fokus.index')->with('success', 'Fokus Berhasil Ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(FokusNasional $FokusNasional)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($fokusNasional)
    {
        $fokus = FokusNasional::find($fokusNasional);
        return Inertia::render('Admin/Nasional/Focus/Edit', [
            'fokus' => $fokus,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FokusNasionalFormRequest $request, $fokusNasional)
    {
        $fokus = FokusNasional::find($fokusNasional);

        $fokus->focnews_title = $request->name;
        $fokus->focnews_description = $request->description;
        $fokus->focnews_keyword = $request->keyword;
        $fokus->status = $request->status;
        $fokus->focnews_image_body = $request->img_desktop_list;
        $fokus->focnews_image_news = $request->img_desktop_news;
        $fokus->focnews_image_mobile = $request->img_mobile;
        $fokus->save();

        return redirect()->route('admin.nasional.fokus.index')->with('success', 'Fokus Berhasil Diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FokusNasional $fokusNasional)
    {
        //
    }
}
