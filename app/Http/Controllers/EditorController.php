<?php

namespace App\Http\Controllers;

use App\Http\Requests\EditorManageRequest;
use App\Models\Editor;
use App\Models\User;
use App\Services\CdnService;
use App\Services\EditorSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class EditorController extends Controller
{
    public function __construct(
        protected CdnService $cdn,
        protected EditorSyncService $sync,
    ) {}

    public function index(Request $request)
    {
        $query = Editor::with(['nasional:editor_id,editor_name,status', 'daerah:id,name,status', 'user:id,full_name,email']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Admin/Editor/Index', [
            'editors' => $query->orderBy('id', 'desc')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Editor/Create', [
            'users' => $this->linkableUsers(),
            'roles' => Role::pluck('name'),
        ]);
    }

    public function edit(Editor $editor)
    {
        $editor->load('nasional', 'daerah', 'user:id,full_name,email');

        return Inertia::render('Admin/Editor/Edit', [
            'editor' => [
                'id'           => $editor->id,
                'name'         => $editor->name,
                'status'       => (string) $editor->status,
                'user_id'      => $editor->user_id,
                'user'         => $editor->user,
                'description'  => $editor->nasional->editor_description ?? '',
                'image'        => $editor->nasional->editor_image ?? null,
                'no_whatsapp'  => $editor->daerah->no_whatsapp ?? '',
                'has_nasional' => (bool) $editor->nasional,
                'has_daerah'   => (bool) $editor->daerah,
            ],
            'users' => $this->linkableUsers($editor->user_id),
            'roles' => Role::pluck('name'),
        ]);
    }

    public function store(EditorManageRequest $request)
    {
        try {
            $userId = $this->resolveUserId($request);

            // Isi name/status di awal: kolom name NOT NULL, dan butuh id sebelum wiring anak.
            $master = new Editor([
                'user_id' => $userId,
                'name'    => $request->name,
                'status'  => $request->status,
            ]);
            $master->save();
            $this->linkUser($userId, $master);
            $this->applySync($master, $request);

            return redirect()->route('admin.editors.index')->with('success', 'Editor berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['error' => 'Gagal menambahkan editor: ' . $e->getMessage()]);
        }
    }

    public function update(EditorManageRequest $request, Editor $editor)
    {
        try {
            $editor->load('nasional', 'daerah');
            $previousUserId = $editor->user_id;

            $userId = $this->resolveUserId($request);
            $editor->user_id = $userId;
            $this->applySync($editor, $request); // save master (dengan user_id baru)

            // Jaga pointer denormalisasi users.id_editor tetap konsisten.
            if ($previousUserId && $previousUserId !== $userId) {
                User::where('id', $previousUserId)->where('id_editor', $editor->id)->update(['id_editor' => null]);
            }
            $this->linkUser($userId, $editor);

            return redirect()->route('admin.editors.index')->with('success', 'Editor berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['error' => 'Gagal memperbarui editor: ' . $e->getMessage()]);
        }
    }

    /**
     * Tentukan user_id: buat akun baru bila diminta, atau pakai yang dipilih.
     */
    private function resolveUserId(EditorManageRequest $request): ?int
    {
        if (!$request->boolean('create_user')) {
            return $request->user_id;
        }

        $user = User::create([
            'full_name' => $request->full_name,
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'status'    => $request->status,
        ]);
        $user->syncRoles($request->roles ?? ['editor']);

        return $user->id;
    }

    /**
     * Isi users.id_editor (guarded -> set langsung) agar dua arah taut konsisten.
     */
    private function linkUser(?int $userId, Editor $master): void
    {
        if (!$userId) {
            return;
        }
        $user = User::find($userId);
        if ($user && $user->id_editor !== $master->id) {
            $user->id_editor = $master->id;
            $user->save();
        }
    }

    /**
     * Upload foto (bila ada) lalu cascade lewat service.
     */
    private function applySync(Editor $master, EditorManageRequest $request): void
    {
        $fields = [
            'name'        => $request->name,
            'status'      => $request->status,
            'description' => $request->description,
            'no_whatsapp' => $request->no_whatsapp,
        ];
        if ($request->hasFile('image')) {
            $fields['image_url'] = $this->cdn->uploadImage($request->file('image'), Str::slug($request->name) . '-editor', 2, 'convert', false);
        }

        $this->sync->sync(
            $master,
            $fields,
            createNasional: $request->boolean('create_nasional'),
            createDaerah: $request->boolean('create_daerah'),
        );
    }

    /**
     * User master yang belum tertaut editor (plus user yang sedang diedit).
     */
    private function linkableUsers(?int $keepUserId = null)
    {
        return User::whereDoesntHave('editor')
            ->when($keepUserId, fn($q) => $q->orWhere('id', $keepUserId))
            ->select('id as value', 'full_name', 'email')
            ->get()
            ->map(fn($u) => ['value' => $u->value, 'label' => "{$u->full_name} ({$u->email})"]);
    }
}
