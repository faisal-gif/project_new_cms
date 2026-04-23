<?php

namespace App\Http\Controllers;

use App\Http\Requests\EditorDaerahRequest;
use App\Http\Requests\EditorFormRequest;
use App\Models\EditorDaerah;
use App\Models\History;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EditorDaerahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EditorDaerah::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $editors = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Daerah/Editor/Index', [
            'editors'   => $editors,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Daerah/Editor/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EditorDaerahRequest $request)
    {
        $data = $request->validated();

        DB::beginTransaction();

        try {
            $editorDaerah = EditorDaerah::create([
                'id_ti' => $data['id_ti'],
                'name' => $data['name'],
                'no_whatsapp' => $data['no_whatsapp'],
                'status' => $data['status'],
            ]);

            DB::commit();
            return redirect()->route('admin.daerah.editor.index')->with('success', 'Editor berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambahkan editor: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(EditorDaerah $editor)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EditorDaerah $editor)
    {
        return Inertia::render('Admin/Daerah/Editor/Edit', [
            'editor' => $editor,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EditorFormRequest $request, EditorDaerah $editor)
    {

        $data = $request->validated();

        DB::beginTransaction();

        try {

            $editor->name =  $data['name'];
            $editor->id_ti = $data['id_ti'];
            $editor->no_whatsapp = $data['no_whatsapp'];
            $editor->status = $data['status'];
            $editor->save();
            DB::commit();

            return redirect()->route('admin.daerah.editor.index')->with('success', 'Editor berhasil diubah.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambahkan editor: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EditorDaerah $editor)
    {
        //
    }
}
