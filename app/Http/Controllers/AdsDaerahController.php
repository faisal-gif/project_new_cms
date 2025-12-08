<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdsDaerahFormRequest;
use App\Models\AdsDaerah;
use App\Models\AdsLocate;
use App\Models\History;
use App\Models\Network;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdsDaerahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AdsDaerah::with('ads_locate');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $ads_daerah = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AdsDaerah/Index', [
            'ads_daerah'   => $ads_daerah,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $networks = Network::select('id', 'name')->get()
            ->map(fn($net) => [
                'value' => $net->id,
                'label' => $net->name,
            ]);

        $locations = AdsLocate::select('id', 'name', 'type')->get()
            ->groupBy('type')
            ->map(function ($group) {
                return $group->map(fn($loc) => [
                    'value' => $loc->id,
                    'label' => $loc->name,
                ]);
            });


        return Inertia::render('Admin/AdsDaerah/Create', [
            'locations' => $locations,
            'networks' => $networks,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AdsDaerahFormRequest $request)
    {

        $auth = Auth::user();

        $adsDaerah = AdsDaerah::create([
            'title' => $request->title,
            'type' => $request->type,
            'created_by' => $auth->id,
            'modifed_by' => $auth->id,
            'locate_id' => $request->location,
            'datestart' => $request->datestart,
            'dateend' => $request->dateend,
            'image' => $request->image,
            'url' => $request->url,
            'cpc' => $request->cpc,
            'cost' => $request->cost,
            'status' => (int) $request->status,
        ]);


        $networkIds = collect($request->network)->pluck('value')->toArray();

        $adsDaerah->networks()->sync($networkIds);


        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'add',
            'tipe' => 'ads daerah',
            'target' => $adsDaerah->title,
        ]);

        return redirect()->route('admin.ads.daerah.index')->with('success', 'Ads Daerah berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AdsDaerah $adsDaerah)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AdsDaerah $list)
    {

        // Semua opsi networks
        $networks = Network::all()->map(fn($n) => [
            'label' => $n->name,
            'value' => $n->id,
        ]);

        // Selected networks (multi select)
        $selectedNetworks = $list->networks->map(fn($n) => [
            'label' => $n->name,
            'value' => $n->id,
        ]);

        $locations = AdsLocate::select('id', 'name', 'type')->get()
            ->groupBy('type')
            ->map(function ($group) {
                return $group->map(fn($loc) => [
                    'value' => $loc->id,
                    'label' => $loc->name,
                ]);
            });


        return Inertia::render('Admin/AdsDaerah/Edit', [
            'item' => $list,
            'networks' => $networks,
            'selectedNetworks' => $selectedNetworks,
            'locations' => $locations,

        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AdsDaerahFormRequest $request, AdsDaerah $list)
    {
        $auth = Auth::user();

        $list->update([
            'title' => $request->title,
            'type' => $request->type,
            'created_by' => $auth->id,
            'modifed_by' => $auth->id,
            'locate_id' => $request->location,
            'datestart' => $request->datestart,
            'dateend' => $request->dateend,
            'image' => $request->image,
            'url' => $request->url,
            'cpc' => $request->cpc,
            'cost' => $request->cost,
            'status' => (int) $request->status,
        ]);


        $networkIds = collect($request->network)->pluck('value')->toArray();

        $list->networks()->sync($networkIds);

        return redirect()
            ->route('admin.ads.daerah.index')
            ->with('success', 'Data berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdsDaerah $adsDaerah)
    {
        //
    }
}
