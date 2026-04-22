<?php

namespace App\Http\Controllers;

use App\Http\Requests\EditorNasionalRequest;
use App\Models\EditorNasional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EditorNasionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EditorNasional::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('editor_name', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $editors = $query->orderBy('editor_id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Nasional/Editor/Index', [
            'editors'   => $editors,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Nasional/Editor/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EditorNasionalRequest $request)
    {
        $data = $request->validated();

        $data['created_by'] = auth()->id();

        DB::beginTransaction();

        try {

            // Pastikan input dari frontend (React) bernama 'image_thumbnail'
            if ($request->hasFile('image')) {
                $file = $request->file('image');

                // Tembak langsung API CDN
                $response = Http::withHeaders([
                    'x-api-key' => 'QgwJShcyArAEGqLXKZ3xzcu4'
                ])->attach(
                    'file', // Key 'file' sesuai dengan form-data API CDN
                    file_get_contents($file->getPathname()),
                    $file->getClientOriginalName()
                )->post('https://cdn.tin.co.id/api/v1/images/upload', [
                    'name'          => Str::slug($data['name']) . '-editor',
                    'category_id'   => '2', // Sesuaikan dengan kategori yang diinginkan
                    'process_type'  => 'convert',
                    'add_watermark' => '0',
                ]);

                // Jika gagal ke CDN, lemparkan error agar DB di-rollback
                if (!$response->successful()) {
                    throw new \Exception('Gagal mengupload thumbnail ke CDN: ' . $response->body());
                }

                $cdnData = $response->json();
                // Ambil URL dari response JSON CDN
                $ImageUrl = $cdnData['data']['url'] ?? $cdnData['url'] ?? null;
            }
            $writerNasional = EditorNasional::create([
                'editor_alias' => Str::slug($data['name'] . '-' . time()),
                'editor_name' => $data['name'],
                'editor_image' => $ImageUrl,
                'editor_description' => $data['description'],
                'status' => $data['status'],
                'created_by' => $data['created_by'],
            ]);

            DB::commit();
            return redirect()->route('admin.nasional.editor.index')->with('success', 'Penulis berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambahkan writer: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $editor = EditorNasional::find($id);

        return Inertia::render('Admin/Nasional/Editor/Edit', [
            'editor' => $editor,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EditorNasionalRequest $request, string $id)
    {
        // 1. Cari penulis berdasarkan ID
        $editor = EditorNasional::findOrFail($id);

        // 2. Ambil data yang valid dari FormRequest
        $data = $request->validated();

        // 3. Gunakan gambar lama sebagai default
        $ImageUrl = $editor->editor_image;
       
        DB::beginTransaction();

        try {
            // 4. Jika ada file gambar baru yang diunggah
            if ($request->hasFile('image')) {
                $file = $request->file('image');

                // Tembak langsung API CDN
                $response = Http::withHeaders([
                    'x-api-key' => 'QgwJShcyArAEGqLXKZ3xzcu4'
                ])->attach(
                    'file',
                    file_get_contents($file->getPathname()),
                    $file->getClientOriginalName()
                )->post('https://cdn.tin.co.id/api/v1/images/upload', [
                    'name'          => Str::slug($data['name']) . '-editor',
                    'category_id'   => '2',
                    'process_type'  => 'convert',
                    'add_watermark' => '0',
                ]);

                // Jika CDN error, batalkan update
                if (!$response->successful()) {
                    throw new \Exception('Gagal mengupload thumbnail baru ke CDN: ' . $response->body());
                }

                // GUNAKAN VARIABEL BERBEDA ($cdnData) AGAR TIDAK MENIMPA INPUT FORM ($data)
                $cdnData = $response->json();

                // Ambil URL dari response JSON CDN dan timpa variabel $ImageUrl
                $ImageUrl = $cdnData['data']['url'] ?? $cdnData['url'] ?? null;
            }

            // 5. Update data penulis ke database
            $editor->update([


                'editor_name'               => $data['name'],
                'editor_alias'              => Str::slug($data['name'] . '-' . time()),
                'editor_image'              => $ImageUrl, // Berisi gambar lama ATAU gambar baru dari CDN
                'editor_description'        => $data['description'],
                'status'                    => $data['status'],
                // created_by tidak perlu diupdate
            ]);

            DB::commit();

            // Redirect dengan pesan sukses
            return redirect()->route('admin.nasional.editor.index')
                ->with('success', 'Data penulis berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal memperbarui data Editor: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
