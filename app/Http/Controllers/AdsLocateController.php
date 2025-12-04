<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdsLocateFormRequest;
use App\Models\AdsLocate;
use App\Models\History;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdsLocateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AdsLocate::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $ads_locate = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AdsLocate/Index', [
            'ads_locates'   => $ads_locate,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AdsLocate/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AdsLocateFormRequest $request)
    {
        $auth = Auth::user();

        $adsLocate = AdsLocate::create([
            'name' => $request->name,
            'type' => $request->type,
            'status' => $request->status,
        ]);


        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'add',
            'tipe' => 'ads locate',
            'target' => $adsLocate->name,
        ]);

        return redirect()->route('admin.ads.locate.index')->with('success', 'Ads Locate berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AdsLocate $adsLocate)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AdsLocate $locate)
    {
        return Inertia::render('Admin/AdsLocate/Edit', [
            'ads_locate' => $locate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AdsLocateFormRequest $request, AdsLocate $locate)
    {
        $auth = Auth::user();

        $locate->name = $request->input('name');
        $locate->type = $request->input('type');
        $locate->status = $request->input('status');
        $locate->save();

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'edit',
            'tipe' => 'ads locate',
            'target' => $locate->name,
        ]);

        return redirect()->route('admin.ads.locate.index')->with('success', 'Ads Locate berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdsLocate $adsLocate)
    {
        //
    }
}
