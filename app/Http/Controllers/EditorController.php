<?php

namespace App\Http\Controllers;

use App\Http\Requests\EditorRequest;
use App\Models\Editor;
use App\Models\EditorDaerah;
use App\Models\EditorNasional;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class EditorController extends Controller
{
    public function index(Request $request)
    {
        $query =  Editor::with(['nasional:editor_id,editor_name,status', 'daerah:id,name,status']);

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

        return Inertia::render('Admin/Editor/Index', [
            'editors' => $editors,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $nasionals = EditorNasional::select('editor_id as value', 'editor_name as label')->get();
        $daerahs = EditorDaerah::select('id as value', 'name as label')->get();

        return Inertia::render('Admin/Editor/Create', [
            'nasionals' => $nasionals,
            'daerahs' => $daerahs,
        ]);
    }

    public function edit(Editor $editor)
    {
        $nasionals = EditorNasional::select('editor_id as value', 'editor_name as label')->get();
        $daerahs = EditorDaerah::select('id as value', 'name as label')->get();

        return Inertia::render('Admin/Editor/Edit', [
            'editor' => $editor,
            'nasionals' => $nasionals,
            'daerahs' => $daerahs,
        ]);
    }

    public function store(EditorRequest $request)
    {
        try {
            DB::beginTransaction();
            
            Editor::create([
                'name' => $request->name,
                'status' => $request->status,
                'id_ti' => $request->id_nasional,
                'id_daerah' => $request->id_daerah,
            ]);

            DB::commit();
            return redirect()->route('admin.editors.index')->with('success', 'Editor berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.editors.index')->with('error', 'Terjadi kesalahan saat menambahkan editor: ' . $e->getMessage());
        }
    }

    public function update(EditorRequest $request, Editor $editor)
    {
        try {
            DB::beginTransaction();
            $editor->update([
                'name' => $request->name,
                'status' => $request->status,
                'id_ti' => $request->id_nasional,
                'id_daerah' => $request->id_daerah,
            ]);

            DB::commit();
            return redirect()->route('admin.editors.index')->with('success', 'Editor berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.editors.index')->with('error', 'Terjadi kesalahan saat memperbarui editor: ' . $e->getMessage());
        }
    }
}
