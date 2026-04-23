<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdsLocateFormRequest;
use App\Models\AdsLocate;
use App\Models\History;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('Admin/Daerah/AdsLocate/Index', [
            'ads_locates'   => $ads_locate,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Daerah/AdsLocate/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AdsLocateFormRequest $request)
    {
        $auth = Auth::user();

        DB::beginTransaction();
        try {
            $adsLocate = AdsLocate::create([
                'name' => $request->name,
                'type' => $request->type,
                'status' => $request->status,
            ]);

            DB::commit();
            return redirect()->route('admin.daerah.adsLocate.index')->with('success', 'Ads Locate berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.daerah.adsLocate.index')->with('error', 'Terjadi kesalahan saat menambahkan Ads Locate: ' . $e->getMessage());
        }
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
    public function edit(AdsLocate $adsLocate)
    {
        return Inertia::render('Admin/Daerah/AdsLocate/Edit', [
            'ads_locate' => $adsLocate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AdsLocateFormRequest $request, AdsLocate $adsLocate)
    {
        $auth = Auth::user();

        try {
            DB::beginTransaction();
            $adsLocate->name = $request->input('name');
            $adsLocate->type = $request->input('type');
            $adsLocate->status = $request->input('status');
            $adsLocate->save();

            DB::commit();
            return redirect()->route('admin.daerah.adsLocate.index')->with('success', 'Ads Locate berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.daerah.adsLocate.index')->with('error', 'Terjadi kesalahan saat memperbarui Ads Locate: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdsLocate $adsLocate)
    {
        //
    }
}
