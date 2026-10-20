<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Berita Pending & pesanan merchandise AJP / Kopi TIMES ditulis aplikasi publik
 * langsung ke mysql_berbayar, jadi CMS hanya bisa tahu dengan memeriksa berkala.
 * Butuh `php artisan schedule:work` (atau cron) agar benar-benar jalan.
 */
Schedule::command('berbayar:pantau-masuk')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();
