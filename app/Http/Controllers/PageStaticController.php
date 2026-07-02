<?php

namespace App\Http\Controllers;

use App\Http\Requests\PageStaticRequest;
use App\Models\PageStatic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PageStaticController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PageStatic::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('page_name', 'like', "%{$request->search}%");
            });
        }

        $pageStatics = $query->select('page_id', 'page_name', 'page_desk')
            ->orderBy('page_id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Nasional/PageStatic/Index', [
            'pageStatics' => $pageStatics,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Nasional/PageStatic/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PageStaticRequest $request)
    {

        try {
            $validatedData = $request->validated();
            DB::beginTransaction();
            // Create a new PageStatic record
            PageStatic::create([
                'page_name' => $validatedData['name'],
                'page_slug' => Str::slug($validatedData['name']),
                'page_desk' => $validatedData['description'],
                'page_keyword' => implode(', ', $validatedData['keyword']),
                'page_isi' => $validatedData['isi'],
            ]);

            DB::commit();
            return redirect()->route('admin.nasional.page-static.index')->with('success', 'Halaman statis berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat membuat halaman statis: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(PageStatic $page_static) {}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PageStatic $page_static)
    {
        return inertia('Admin/Nasional/PageStatic/Edit', [
            'pageStatic' => $page_static
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PageStaticRequest $request, PageStatic $page_static)
    {
        try {
            // Validasi menggunakan FormRequest yang sama dengan Create
            $validatedData = $request->validated();

            DB::beginTransaction();

            $page_static->update([
                'page_name'    => $validatedData['name'],
                'page_slug'    => Str::slug($validatedData['name']),
                'page_desk'    => $validatedData['description'],
                'page_keyword' => implode(', ', $validatedData['keyword']),
                'page_isi'     => $validatedData['isi'],
            ]);

            DB::commit();

            return redirect()->route('admin.nasional.page-static.index')
                ->with('success', 'Halaman statis berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollback();

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui halaman statis: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PageStatic $pageStatic)
    {
        //
    }
}
