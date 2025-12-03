<?php

namespace App\Http\Controllers;

use App\Http\Requests\KanalFormRequest;
use App\Models\History;
use App\Models\Kanal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KanalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = Kanal::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('slug', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $kanal = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Kanal/Index', [
            'kanal'   => $kanal,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Kanal/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(KanalFormRequest $request)
    {
        $auth = Auth::user();


        $kanal = Kanal::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'keyword' => $request->input('keyword'),
            'description' => $request->description,
            'status' => $request->status,
        ]);

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'add',
            'tipe' => 'kanal',
            'target' => $kanal->name,
        ]);

        return redirect()->route('admin.kanal.index')->with('success', 'Kanal Berhasil Ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kanal $kanal)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kanal $kanal)
    {
        return Inertia::render('Admin/Kanal/Edit', [
            'kanal' => $kanal,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(KanalFormRequest $request, Kanal $kanal)
    {
        $auth = Auth::user();

        $kanal->name = $request->input('name');
        $kanal->slug = $request->input('slug');
        $kanal->keyword = $request->input('keyword');
        $kanal->description = $request->input('description');
        $kanal->status = $request->input('status');
        $kanal->save();

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'edit',
            'tipe' => 'kanal',
            'target' => $kanal->name,
        ]);


        return redirect()->route('admin.kanal.index')->with('success', 'Kanal Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kanal $kanal)
    {
        //
    }
}
