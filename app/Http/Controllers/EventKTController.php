<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventKTRequest;
use App\Models\Event;
use App\Models\NewsBerbayar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EventKTController extends Controller
{
    public function index(Request $request)
    {
        // terpakai = COUNT(news WHERE event_id = e.id) — dihitung, bukan kolom counter.
        $events = Event::withCount('submissions')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category', $request->category);
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Kopi_Times/Event/Index', [
            'events'     => $events,
            'filters'    => $request->only(['search', 'category']),
            'public_url' => config('services.berbayar.kt_url'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Kopi_Times/Event/Create', [
            'public_url' => config('services.berbayar.kt_url'),
        ]);
    }

    public function store(EventKTRequest $request)
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // CMS wajib mengisi slug (aplikasi publik tidak generate untuk insert dari CMS).
            $validated['slug']    = $this->uniqueSlug($validated['name']);
            $validated['enabled'] = $request->boolean('enabled');

            Event::create($validated);

            DB::commit();

            return redirect()->route('admin.kopi-times.events.index')
                ->with('success', 'Event berhasil dibuat!');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Terjadi kesalahan sistem saat menyimpan data: ' . $e->getMessage(),
            ]);
        }
    }

    public function edit(Event $event)
    {
        return Inertia::render('Admin/Kopi_Times/Event/Edit', [
            'event'      => $event,
            'public_url' => config('services.berbayar.kt_url'),
        ]);
    }

    public function update(EventKTRequest $request, Event $event)
    {
        $validated = $request->validated();

        try {
            // Slug DIKUNCI saat edit: URL /kirim-berita/{slug} mungkin sudah dibagikan,
            // regenerate akan mematikan link lama. Slug hanya dibuat sekali saat create.
            unset($validated['slug']);
            $validated['enabled'] = $request->boolean('enabled');

            $event->update($validated);

            return redirect()->route('admin.kopi-times.events.index')
                ->with('success', 'Event berhasil diperbarui!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Terjadi kesalahan sistem saat menyimpan data: ' . $e->getMessage(),
            ]);
        }
    }

    // Aksi cepat on/off dari list.
    public function toggle(Event $event)
    {
        $event->update(['enabled' => ! $event->enabled]);

        return back()->with('success', 'Status event diperbarui.');
    }

    // Daftar kiriman publik untuk satu event (public_event) — disambungkan ke alur review.
    public function submissions(Request $request, Event $event)
    {
        $submissions = NewsBerbayar::where('event_id', $event->id)
            ->select('id', 'title', 'narsum', 'city', 'contact', 'status', 'created')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Kopi_Times/Event/Submissions', [
            'event'       => $event,
            'submissions' => $submissions,
        ]);
    }

    public function destroy(Event $event)
    {
        // Cegah hapus bila sudah ada kiriman — arahkan untuk non-aktifkan saja.
        if ($event->submissions()->count() > 0) {
            return back()->withErrors([
                'error' => 'Event tidak bisa dihapus karena sudah punya kiriman. Non-aktifkan saja (Enabled = off).',
            ]);
        }

        $event->delete();

        return redirect()->route('admin.kopi-times.events.index')
            ->with('success', 'Event berhasil dihapus.');
    }

    // Generate slug unik dari name; tambah sufiks -2, -3, ... bila bentrok.
    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'event';
        $slug = $base;
        $i = 2;

        while (Event::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
