<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;
        $logName = $request->log_name;
        $action = $request->action; // created | updated | deleted

        $activities = Activity::with(['causer', 'subject'])
            ->when($logName, fn ($q) => $q->where('log_name', $logName))
            ->when($action, function ($q) use ($action) {
                // Samakan dengan pengelompokan badge di frontend (parseAction):
                // aksi Spatie bawaan + log manual berbahasa Indonesia.
                $map = [
                    'created' => ['created', '%buat%', '%tambah%'],
                    'updated' => ['updated', '%edit%', '%update%'],
                    'deleted' => ['deleted', '%hapus%'],
                ];
                $terms = $map[$action] ?? [$action];
                $q->where(function ($sub) use ($terms) {
                    foreach ($terms as $t) {
                        str_contains($t, '%')
                            ? $sub->orWhere('description', 'like', $t)
                            : $sub->orWhere('description', $t);
                    }
                });
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('subject_type', 'like', "%{$search}%")
                        ->orWhere('subject_id', $search)
                        ->orWhereHas('causer', fn ($c) => $c->where('full_name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($activity) {
                return [
                    'id'           => $activity->id,
                    'log_name'     => $activity->log_name, // Contoh: "Berita Daerah", "Import Berita"
                    'description'  => $activity->description, // "created", "updated", dll
                    'causer_name'  => $activity->causer ? $activity->causer->full_name : 'Sistem Otomatis',
                    'subject_type' => class_basename($activity->subject_type), // Contoh: "NewsDaerah"
                    'subject_id'   => $activity->subject_id,
                    'properties'   => $activity->properties, // Berisi 'attributes' (data baru) & 'old' (data lama)
                    'created_at'   => $activity->created_at->format('d M Y, H:i:s'),
                ];
            });


        return Inertia::render('Admin/History/Index', [
            'activities' => $activities,
            'filters'    => [
                'search'   => $search,
                'log_name' => $logName,
                'action'   => $action,
            ],
            // Daftar modul unik untuk dropdown filter.
            'logNames'   => Activity::query()->distinct()->orderBy('log_name')->pluck('log_name')->filter()->values(),
        ]);
    }
}
