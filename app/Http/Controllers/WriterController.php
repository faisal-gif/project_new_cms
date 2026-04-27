<?php

namespace App\Http\Controllers;

use App\Http\Requests\WriterRequest;
use App\Models\NetworkDaerah;
use App\Models\Writer;
use App\Models\WriterDaerah;
use App\Models\WriterNasional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;

class WriterController extends Controller
{
    public function index(Request $request)
    {
        $query = Writer::with(['nasional:id,name,status', 'daerah:id,name,status']);

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

        return Inertia::render('Admin/Writer/Index', [
            'writers' => $writer,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $nasionals = WriterNasional::select('id as value', 'name as label')->get();
        $daerahs = WriterDaerah::select('id as value', 'name as label')->get();
        $networks = NetworkDaerah::select('id as value', 'name as label')->get();

        return Inertia::render('Admin/Writer/Create', [
            'nasionals' => $nasionals,
            'daerahs' => $daerahs,
            'networks' => $networks,
        ]);
    }

    public function edit(Writer $writer)
    {

        $nasionals = WriterNasional::select('id as value', 'name as label')->get();
        $daerahs = WriterDaerah::select('id as value', 'name as label')->get();
        $networks = NetworkDaerah::select('id as value', 'name as label')->get();


        return Inertia::render('Admin/Writer/Edit', [
            'writer' => $writer,
            'nasionals' => $nasionals,
            'daerahs' => $daerahs,
            'networks' => $networks,
        ]);
    }

    public function store(WriterRequest $request)
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();

            Writer::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'], // Pastikan password di-hash dengan benar
                'no_whatsapp' => $data['no_whatsapp'],
                'date_exp' => $data['date_exp'],
                'network_id' => $data['network_id'],
                'id_nasional' => $data['id_nasional'] ?? null,
                'id_daerah' => $data['id_daerah'] ?? null,
                'status' => $data['status'],
            ]);

            DB::commit();
            return redirect()->route('admin.writers.index')->with('success', 'Penulis berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()]);
        }
    }

    public function update(WriterRequest $request, Writer $writer)
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();

            $writer->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'] ?? $writer->password, // Hanya update password jika ada input baru
                'no_whatsapp' => $data['no_whatsapp'],
                'date_exp' => $data['date_exp'],
                'network_id' => $data['network_id'],
                'id_nasional' => $data['id_nasional'] ?? null,
                'id_daerah' => $data['id_daerah'] ?? null,
                'status' => $data['status'],
            ]);

            DB::commit();
            return redirect()->route('admin.writers.index')->with('success', 'Penulis berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage()]);
        }
    }
}
