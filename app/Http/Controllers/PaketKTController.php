<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaketKtRequest;
use App\Models\PaketBerita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaketKTController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $pakets = PaketBerita::query()
            ->where('type', 4)
            ->withCount('itemsLainnya')
            ->with('itemsLainnya')


            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })

            ->when($request->filled('type'), function ($query) use ($request) {
                $query->where('type', $request->type);
            })

            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })

            ->orderByDesc('created')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Kopi_Times/Paket/Index', [
            'pakets'  => $pakets,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Kopi_Times/Paket/Create');
    }

    public function store(PaketKtRequest $request)
    {
        $validated = $request->validated();

        DB::connection('mysql_berbayar')->transaction(function () use ($validated, $request) {
            $validated['type'] = 4;
            $paket = PaketBerita::create([
                ...collect($validated)->except('items_lainnya')->all(),
                'created_by' => $request->user()->id,
            ]);

            if (!empty($validated['items_lainnya'])) {
                $paket->itemsLainnya()->createMany($validated['items_lainnya']);
            }
        });

        return redirect()
            ->route('admin.kopi-times.paket.index')
            ->with('success', 'Paket berita berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaketBerita $paket)
    {
        $paket->load('itemsLainnya');

        return Inertia::render('Admin/Kopi_Times/Paket/Edit', [
            'paket' => $paket,
        ]);
    }

    public function update(PaketKtRequest $request, PaketBerita $paket)
    {
        $validated = $request->validated();

        DB::connection('mysql_berbayar')->transaction(function () use ($validated, $request, $paket) {
            $validated['type'] = 4;
            $paket->update([
                ...collect($validated)->except('items_lainnya')->all(),
                'modified_by' => $request->user()->id,
            ]);

            $items = collect($validated['items_lainnya'] ?? []);

            $paket->itemsLainnya()
                ->whereNotIn('id', $items->pluck('id')->filter()->all())
                ->delete();

            foreach ($items as $item) {
                $payload = [
                    'nama_item' => $item['nama_item'],
                    'type'      => $item['type'] ?? null,
                    'qty'       => $item['qty'],
                ];

                if (!empty($item['id'])) {
                    $paket->itemsLainnya()->where('id', $item['id'])->update($payload);
                } else {
                    $paket->itemsLainnya()->create($payload);
                }
            }
        });

        return redirect()
            ->route('admin.kopi-times.paket.index')
            ->with('success', 'Paket berita berhasil diperbarui.');
    }
}
