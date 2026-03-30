<?php

namespace App\Http\Controllers;

use App\Http\Requests\EditorFormRequest;
use App\Models\EditorDaerah;
use App\Models\History;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
        $auth = Auth::user();

        $editor->name = $request->input('name');
        $editor->id_ti = $request->input('id_ti');
        $editor->no_whatsapp = $request->input('no_whatsapp');
        $editor->status = $request->input('status');
        $editor->save();

        if ($editor->user_id) {
            $user = User::find($editor->user_id);
            $user->full_name = $editor->name;
            $user->status = $editor->status;
            $user->save();
        }

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'edit',
            'tipe' => 'editor',
            'target' => $editor->name,
        ]);

        return redirect()->route('admin.editor.editor.index')->with('success', 'Editor berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EditorDaerah $editor)
    {
        //
    }
}
