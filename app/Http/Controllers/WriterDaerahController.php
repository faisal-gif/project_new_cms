<?php

namespace App\Http\Controllers;

use App\Http\Requests\WriterFormRequest;
use App\Models\History;
use App\Models\Network;
use App\Models\NetworkDaerah;

use App\Models\WriterDaerah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class WriterDaerahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = WriterDaerah::with('network');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }



        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $writer = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Daerah/Writer/Index', [
            'writers' => $writer,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $networks = NetworkDaerah::select('id', 'name')->get()
            ->map(fn($net) => [
                'value' => $net->id,
                'label' => $net->name,
            ]);

        return Inertia::render('Admin/Daerah/Writer/Create', [
            'networks' => $networks
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(WriterFormRequest $request)
    {
        $auth = Auth::user();


        $writer = WriterDaerah::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'network_id' => $request->network_id,
            'no_whatsapp' => $request->no_whatsapp,
            'date_exp' => date('Y-m-d', strtotime($request->date_exp)),
            'status' => $request->status,
        ]);

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'add',
            'tipe' => 'writer',
            'target' => $writer->name,
        ]);

        return redirect()->route('admin.daerah.writer.index')->with('success', 'Writer Berhasil Ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(WriterDaerah $writer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WriterDaerah $writer)
    {

        $networks = NetworkDaerah::select('id', 'name')->get()
            ->map(fn($net) => [
                'value' => $net->id,
                'label' => $net->name,
            ]);

        return Inertia::render('Admin/Daerah/Writer/Edit', [
            'networks' => $networks,
            'writer' => $writer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(WriterFormRequest $request, WriterDaerah $writer)
    {
        $auth = Auth::user();

        $writer->name = $request->input('name');
        $writer->no_whatsapp = $request->no_whatsapp;
        $writer->email = $request->input('email');
        $writer->network_id = $request->input('network_id');
        $writer->date_exp = date('Y-m-d', strtotime($request->date_exp));
        $writer->status = $request->input('status');
        $writer->save();

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'edit',
            'tipe' => 'writer',
            'target' => $writer->name,
        ]);

         return redirect()->route('admin.daerah.writer.index')->with('success', 'Writer Berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WriterDaerah $writer)
    {
        //
    }
}
