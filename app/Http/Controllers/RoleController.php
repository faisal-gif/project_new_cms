<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        // Gunakan Eager Loading (with) untuk menghindari N+1 problem
        $roles = Role::with('permissions')->paginate(10);
        return Inertia::render('Admin/Roles/Index', ['roles' => $roles]);
    }

    public function create()
    {
        $permissionsGrouped = Permission::all()->groupBy('category');
        return Inertia::render('Admin/Roles/Create', [
            'permissionsGrouped' => $permissionsGrouped
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $validated['name']]);

        // Sync permissions secara otomatis
        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('admin.roles.index')->with('success', 'Role berhasil dibuat.');
    }

    public function edit(Role $role)
    {
        $permissionsGrouped = Permission::all()->groupBy('category');

        // Ambil nama-nama permission yang sudah dimiliki role ini untuk React state
        $rolePermissions = $role->permissions->pluck('name')->toArray();

        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'rolePermissions' => $rolePermissions,
            'permissionsGrouped' => $permissionsGrouped
        ]);
    }

    public function update(Request $request, Role $role)
    {
        // Proteksi: Jangan biarkan super-admin diubah namanya oleh siapapun
        if ($role->name === 'super-admin' && $request->name !== 'super-admin') {
            return back()->with('error', 'Nama role Super Admin tidak boleh diubah.');
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $validated['name']]);

        // Sync secara cerdas menghapus yang tidak dicentang dan menambah yang dicentang
        $role->syncPermissions($request->permissions ?? []);

        return redirect()->route('admin.roles.index')->with('success', 'Role berhasil diperbarui.');
    }
}
