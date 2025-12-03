<?php

namespace App\Http\Controllers;

use App\Http\Requests\FokusFormRequest;
use App\Models\Fokus;
use App\Models\History;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FokusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Fokus::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $focus = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Focus/Index', [
            'focus'   => $focus,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Focus/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FokusFormRequest $request)
    {
        $auth = Auth::user();

        $fokus = Fokus::create([
            'name' => $request->name,
            'keyword' => $request->keyword,
            'status' => $request->status,
            'img_desktop_list' => $request->img_desktop_list,
            'img_desktop_news' => $request->img_desktop_news,
            'img_mobile' => $request->img_mobile,
            'description' => $request->description,
        ]);

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'add',
            'tipe' => 'fokus',
            'target' => $fokus->name,
        ]);

        return redirect()->route('admin.fokus.index')->with('success', 'Fokus Berhasil Ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Fokus $fokus)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Fokus $foku)
    {
        return Inertia::render('Admin/Focus/Edit', [
            'fokus' => $foku,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FokusFormRequest $request, Fokus $foku)
    {

        $auth = Auth::user();

        $foku->name = $request->name;
        $foku->keyword = $request->keyword;
        $foku->status = $request->status;
        $foku->img_desktop_list = $request->img_desktop_list;
        $foku->img_desktop_news = $request->img_desktop_news;
        $foku->img_mobile = $request->img_mobile;
        $foku->description = $request->description;
        $foku->save();

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'edit',
            'tipe' => 'fokus',
            'target' => $foku->name,
        ]);

         return redirect()->route('admin.fokus.index')->with('success', 'Fokus Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fokus $fokus)
    {
        //
    }
}
