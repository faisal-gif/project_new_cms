<?php

namespace App\Http\Controllers;

use App\Http\Requests\NetworkFormRequest;
use App\Models\History;
use App\Models\Network;
use App\Models\NetworkDaerah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NetworkDaerahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = NetworkDaerah::select('id', 'title', 'domain', 'name', 'analytics', 'is_web', 'status');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('name', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $networks = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Daerah/Network/Index', [
            'networks'   => $networks,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Daerah/Network/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NetworkFormRequest $request)
    {
        $auth = Auth::user();

        $network = NetworkDaerah::create([
            'name' => $request->name,
            'domain' => $request->domain,
            'slug' => Str::slug($request->name),
            'title' => $request->title,
            'tagline' => $request->tagline,
            'logo' => $request->logo,
            'logo_m' => $request->logo_m,
            'keyword' => $request->keyword,
            'description' => $request->description,
            'img_socmed' => $request->img_socmed,
            'analytics' => $request->analytics,
            'gverify' => $request->gverify,
            'fb' => $request->fb,
            'tw' => $request->tw,
            'ig' => $request->ig,
            'gp' => $request->gp,
            'yt' => $request->yt,
            'is_main' => $request->is_main,
            'is_web' => $request->is_web,
            'status' => $request->status,
        ]);

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'add',
            'tipe' => 'network',
            'target' => $network->name,
        ]);

        return redirect()->route('admin.daerah.network.index')->with('success', 'Network Berhasil Ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(NetworkDaerah $network)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(NetworkDaerah $network)
    {
        return Inertia::render('Admin/Daerah/Network/Edit', [
            'network' => $network,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NetworkFormRequest $request, NetworkDaerah $network)
    {
        $auth = Auth::user();

        $network->name = $request->name;
        $network->domain = $request->domain;
        $network->slug = Str::slug($request->name);
        $network->title = $request->title;
        $network->tagline = $request->tagline;
        $network->keyword = $request->keyword;
        $network->description = $request->description;
        $network->logo = $request->logo;
        $network->logo_m = $request->logo_m;
        $network->img_socmed = $request->img_socmed;
        $network->analytics = $request->analytics;
        $network->gverify = $request->gverify;
        $network->fb = $request->fb;
        $network->tw = $request->tw;
        $network->ig = $request->ig;
        $network->gp = $request->gp;
        $network->yt = $request->yt;
        $network->is_main = $request->is_main;
        $network->is_web = $request->is_web;
        $network->status = $request->status;

        $network->save();

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'edit',
            'tipe' => 'network',
            'target' => $network->name,
        ]);

        return redirect()->route('admin.daerah.network.index')->with('success', 'Network Berhasil Diubah');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NetworkDaerah $network)
    {
        //
    }
}
