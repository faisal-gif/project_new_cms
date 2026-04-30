<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserFormRequest;
use App\Models\Editor;
use App\Models\History;
use App\Models\User;
use App\Models\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{


    

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = User::with('roles:name');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('full_name', 'like', "%{$request->search}%")
                    ->orWhere('username', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }



        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();


        return Inertia::render('Admin/User/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $writers = Writer::select('id as value', 'name as label')->get();
        $editors = Editor::select('id as value', 'name as label')->get();
        $roles = Role::pluck('name');
      
        return Inertia::render('Admin/User/Create', [
            'writers' => $writers,
            'editors' => $editors,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserFormRequest $request)
    {


        try {
            DB::beginTransaction();

            $user = User::create([
                'full_name' => $request->input('full_name'),
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_default_password' => 0,
                'status' => $request->status,
                'id_writer' => $request->id_writer,
                'id_editor' => $request->id_editor,
                'id_fotografer' => $request->id_fotografer,
            ]);

            $user->syncRoles($request->roles ?? []);

            DB::commit();
            return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.users.index')->with('error', 'Gagal menambahkan user: ' . $e->getMessage());
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
    public function edit(User $user)
    {
        $writers = Writer::select('id as value', 'name as label')->get();
        $editors = Editor::select('id as value', 'name as label')->get();
        $roles = Role::pluck('name');
        $userRoles = $user->roles->pluck('name')->toArray();

        return Inertia::render('Admin/User/Edit', [
            'user' => $user,
            'writers' => $writers,
            'editors' => $editors,
            'roles' => $roles,
            'userRoles' => $userRoles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserFormRequest $request, User $user)
    {


        try {
            DB::beginTransaction();

            $user->full_name = $request->input('full_name');
            $user->username = $request->username;
            $user->email = $request->email;
            if ($request->password) {
                $user->password = Hash::make($request->password);
            }
            $user->status = $request->status;
            $user->id_writer = $request->id_writer;
            $user->id_editor = $request->id_editor;
            $user->id_fotografer = $request->id_fotografer;
            $user->save();

            $user->syncRoles($request->roles ?? []);

            DB::commit();
            return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.users.index')->with('error', 'Gagal memperbarui user: ' . $e->getMessage());
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
