<?php

namespace App\Http\Controllers;

use App\Http\Requests\EditorProfileUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Services\CdnService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Data editor lintas-DB (master + nasional + daerah), hanya untuk role editor.
        $editor = null;
        if ($user->hasRole('editor') && $user->editor) {
            $master = $user->editor->load('nasional', 'daerah');
            $editor = [
                'name'         => $master->name,
                'alias'        => $master->nasional->editor_alias ?? '',
                'description'  => $master->nasional->editor_description ?? '',
                'image'        => $master->nasional->editor_image ?? null,
                'no_whatsapp'  => $master->daerah->no_whatsapp ?? '',
                'has_nasional' => (bool) $master->nasional,
                'has_daerah'   => (bool) $master->daerah,
            ];
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'editor' => $editor,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update data editor (self-service). Nama disimpan ke master lalu
     * di-cascade ke editor nasional & daerah yang tertaut.
     */
    public function updateEditor(EditorProfileUpdateRequest $request, CdnService $cdn): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasRole('editor') && $user->editor, 403);

        $master = $user->editor->load('nasional', 'daerah');

        // Upload foto lebih dulu (di luar update). Kalau gagal, batalkan tanpa
        // menyentuh data agar tidak setengah jadi.
        $imageUrl = $master->nasional->editor_image ?? null;
        if ($request->hasFile('image')) {
            try {
                $imageUrl = $cdn->uploadImage($request->file('image'), Str::slug($request->name) . '-editor', 6, 'convert', false);
            } catch (\Exception $e) {
                return back()->withInput()->withErrors(['image' => 'Gagal mengunggah foto ke CDN: ' . $e->getMessage()]);
            }
        }

        // ponytail: 3 koneksi DB berbeda, tak ada transaksi lintas-DB. Update
        // berurutan; profil single-user jadi risiko konsistensi kecil.
        // 1. Master = sumber nama.
        $master->update(['name' => $request->name]);

        // 2. Nasional: cascade nama + field khusus nasional.
        if ($master->nasional) {
            $master->nasional->update([
                'editor_name'        => $request->name,
                'editor_alias'       => $request->alias,
                'editor_description' => $request->description,
                'editor_image'       => $imageUrl,
            ]);
        }

        // 3. Daerah: cascade nama + no WhatsApp.
        if ($master->daerah) {
            $master->daerah->update([
                'name'        => $request->name,
                'no_whatsapp' => $request->no_whatsapp,
            ]);
        }

        return Redirect::route('profile.edit')->with('success', 'Profil editor berhasil diperbarui.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
