<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserFormRequest;
use App\Models\Editor;
use App\Models\History;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = User::query();

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
        return Inertia::render('Admin/User/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserFormRequest $request)
    {


        $auth = Auth::user();

        $user = User::create([
            'full_name' => $request->input('full_name'),
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_default_password' => 0,
            'status' => $request->status,
        ]);

        $role = $user->role;
        if ($role == 3) {
            $editor = Editor::create([
                'name' => $request->input('full_name'),
                'user_id' => $user->id,
                'status' => $request->status,
            ]);
        }

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'add',
            'tipe' => 'user',
            'target' => $user->full_name,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
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
        return Inertia::render('Admin/User/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserFormRequest $request, User $user)
    {

        $auth = Auth::user();

        $user->full_name = $request->input('full_name');
        $user->username = $request->username;
        $user->email = $request->email;
        if ($request->password) {
            $user->password = Hash::make($request->password);
        }
        $user->role = $request->role;
        $user->status = $request->status;
        $user->save();


        $role = $user->role;
        if ($role == 3) {
            $editor = Editor::where('user_id', $user->id)->first();
            $editor->name = $user->full_name;
            $editor->status = $user->status;
            $editor->save();
        }

        $history = History::create([
            'user_id' => $auth->id,
            'action' => 'edit',
            'tipe' => 'user',
            'target' => $user->full_name,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
