<?php

namespace App\Http\Controllers;

use App\Http\Requests\WriterNasionalRequest;
use App\Models\WriterNasional;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WriterNasionalController extends Controller
{

    public function __construct(
        protected CdnService $cdnService
    ) {}


    public function index(Request $request)
    {
        $query = WriterNasional::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $writer = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Nasional/Writer/Index', [
            'writers' => $writer,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Nasional/Writer/Create');
    }

    public function store(WriterNasionalRequest $request)
    {
        $data = $request->validated();

        $data['created_by'] = auth()->id();

        DB::beginTransaction();

        try {

            // Pastikan input dari frontend (React) bernama 'image_thumbnail'
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $profileImage = Str::slug($data['name']) . '-profile';

                $ImageUrl = $this->cdnService->uploadImage($file, $profileImage, 2, 'convert', false);
            }

            $writerNasional = WriterNasional::create([
                'slug' => Str::slug($data['name'] . '-' . time()),
                'name' => $data['name'],
                'type' => $data['type'],
                'image' => $ImageUrl,
                'region' => $data['region'],
                'bio' => $data['bio'],
                'datejoin' => $data['date_join'],
                'status' => $data['status'],
                'created_by' => $data['created_by'],
            ]);

            DB::commit();
            return redirect()->route('admin.nasional.writer.index')->with('success', 'Penulis berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambahkan writer: ' . $e->getMessage());
        }
    }

    public function edit($writerNasional)
    {
        $writer = WriterNasional::find($writerNasional);

        return Inertia::render('Admin/Nasional/Writer/Edit', [
            'writer' => $writer,
        ]);
    }

    public function update(WriterNasionalRequest $request, $id)
    {
        // 1. Cari penulis berdasarkan ID
        $writer = WriterNasional::findOrFail($id);

        // 2. Ambil data yang valid dari FormRequest
        $data = $request->validated();

        // 3. Gunakan gambar lama sebagai default
        $ImageUrl = $writer->image;

        DB::beginTransaction();

        try {
            // 4. Jika ada file gambar baru yang diunggah
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $profileImage = Str::slug($data['name']) . '-profile';

                $ImageUrl = $this->cdnService->uploadImage($file, $profileImage, 2, 'convert', false);
            }

            // 5. Update data penulis ke database
            $writer->update([
                'name'     => $data['name'],
                'image'    => $ImageUrl, // Berisi gambar lama ATAU gambar baru dari CDN
                'type'     => $data['type'],
                'region'   => $data['region'],
                'bio'      => $data['bio'],
                'datejoin' => $data['date_join'],
                'status'   => $data['status'],
                // created_by tidak perlu diupdate
            ]);

            DB::commit();

            // Redirect dengan pesan sukses
            return redirect()->route('admin.nasional.writer.index')
                ->with('success', 'Data penulis berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal memperbarui data writer: ' . $e->getMessage());
        }
    }
}
