<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::query();


        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }



        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $permissions = $query->orderBy('category')->orderBy('id')
            ->paginate(15)
            ->withQueryString();

        // Ambil daftar kategori unik untuk dropdown pilihan di form
        $categories = Permission::select('category as value', 'category as label')->whereNotNull('category')->distinct()->get();
        $categories->prepend(['value' => '', 'label' => 'All']); // Menambahkan opsi "All" di awal dropdown


        return Inertia::render('Admin/Permission/Index', [
            'permissions' => $permissions,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
            'category' => 'required|string',
        ]);

        Permission::create($validated);

        return redirect()->back()->with('success', 'Permission berhasil ditambahkan.');
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name,' . $permission->id,
            'category' => 'required|string',
        ]);

        $permission->update($validated);

        return redirect()->back()->with('success', 'Permission berhasil diperbarui.');
    }
}
