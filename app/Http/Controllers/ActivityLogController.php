<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        // Ambil data log, urutkan dari yang terbaru, dan paginasi (15 data per halaman)
        $activities = Activity::with(['causer', 'subject'])
            ->latest()
            ->paginate(15)
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
        ]);
    }
}
