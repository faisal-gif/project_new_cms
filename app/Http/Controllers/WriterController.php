<?php

namespace App\Http\Controllers;

use App\Http\Requests\WriterManageRequest;
use App\Models\NetworkDaerah;
use App\Models\Writer;
use App\Models\WriterDaerah;
use App\Models\WriterNasional;
use App\Services\CdnService;
use App\Services\WriterSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WriterController extends Controller
{
    public function __construct(
        protected CdnService $cdn,
        protected WriterSyncService $sync,
    ) {}

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

        return Inertia::render('Admin/Writer/Index', [
            'writers' => $query->orderBy('id', 'desc')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Writer/Create', [
            'networks' => NetworkDaerah::select('id as value', 'name as label')->get(),
            'nasionals' => $this->linkableNasional(),
            'daerahs' => $this->linkableDaerah(),
        ]);
    }

    public function edit(Writer $writer)
    {
        $writer->load('nasional', 'daerah');

        return Inertia::render('Admin/Writer/Edit', [
            'writer' => [
                'id'           => $writer->id,
                'name'         => $writer->name,
                'email'        => $writer->email,
                'no_whatsapp'  => $writer->no_whatsapp,
                'date_exp'     => $writer->date_exp instanceof \DateTimeInterface ? $writer->date_exp->format('Y-m-d') : $writer->date_exp,
                'network_id'   => $writer->network_id,
                'status'       => (string) $writer->status,
                'bio'          => $writer->nasional->bio ?? '',
                'region'       => $writer->nasional->region ?? '',
                'image'        => $writer->nasional->image ?? null,
                'has_nasional' => (bool) $writer->nasional,
                'has_daerah'   => (bool) $writer->daerah,
            ],
            'networks' => NetworkDaerah::select('id as value', 'name as label')->get(),
            'nasionals' => $this->linkableNasional($writer->id_nasional),
            'daerahs' => $this->linkableDaerah($writer->id_daerah),
        ]);
    }

    /** Penulis nasional (journalist) yang belum tertaut master. */
    private function linkableNasional(?int $keepId = null)
    {
        $used = Writer::whereNotNull('id_nasional')->pluck('id_nasional')->all();
        return WriterNasional::when($used, fn($q) => $q->whereNotIn('id', $used))
            ->when($keepId, fn($q) => $q->orWhere('id', $keepId))
            ->select('id as value', 'name as label')
            ->get();
    }

    /** Penulis daerah (writers) yang belum tertaut master. */
    private function linkableDaerah(?int $keepId = null)
    {
        $used = Writer::whereNotNull('id_daerah')->pluck('id_daerah')->all();
        return WriterDaerah::when($used, fn($q) => $q->whereNotIn('id', $used))
            ->when($keepId, fn($q) => $q->orWhere('id', $keepId))
            ->select('id as value', 'name as label')
            ->get();
    }

    public function store(WriterManageRequest $request)
    {
        try {
            $master = new Writer($this->masterFields($request));
            $master->save(); // butuh id sebelum wiring anak
            $this->applySync($master, $request);

            return redirect()->route('admin.writers.index')->with('success', 'Penulis berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['error' => 'Gagal menambahkan penulis: ' . $e->getMessage()]);
        }
    }

    public function update(WriterManageRequest $request, Writer $writer)
    {
        try {
            $writer->load('nasional', 'daerah');
            $writer->fill($this->masterFields($request, $writer));
            $this->applySync($writer, $request);

            return redirect()->route('admin.writers.index')->with('success', 'Penulis berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['error' => 'Gagal memperbarui penulis: ' . $e->getMessage()]);
        }
    }

    /**
     * Field master writer. Password di-hash (bcrypt) saat ada input baru,
     * konsisten dengan WriterDaerahController & login wartawan. Saat update
     * tanpa password baru, pakai hash lama apa adanya.
     */
    private function masterFields(WriterManageRequest $request, ?Writer $existing = null): array
    {
        return [
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => $request->filled('password') ? Hash::make($request->password) : ($existing->password ?? null),
            'no_whatsapp' => $request->no_whatsapp,
            'date_exp'    => $request->date_exp,
            'network_id'  => $request->network_id,
            'status'      => $request->status,
        ];
    }

    private function applySync(Writer $master, WriterManageRequest $request): void
    {
        $fields = [
            'name'   => $request->name,
            'status' => $request->status,
            'bio'    => $request->bio,
            'region' => $request->region,
        ];
        if ($request->hasFile('image')) {
            $fields['image_url'] = $this->cdn->uploadImage($request->file('image'), Str::slug($request->name) . '-writer', 2, 'convert', false);
        }

        $this->sync->sync($master, $fields, [
            'nasional_id'     => $request->nasional_id,
            'create_nasional' => $request->boolean('create_nasional'),
            'daerah_id'       => $request->daerah_id,
            'create_daerah'   => $request->boolean('create_daerah'),
        ]);
    }
}
