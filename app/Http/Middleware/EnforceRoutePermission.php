<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;

/**
 * Menegakkan permission di sisi backend berdasarkan nama route admin, sehingga
 * pembatasan tidak hanya mengandalkan penyembunyian menu di frontend.
 *
 * Nama permission mengikuti konvensi "{verb} {resource}"
 * (mis. "view news nasional", "delete permission master").
 *
 * PENTING: sebuah route hanya digerbang bila permission hasil pemetaan benar-benar
 * ADA (dicek via cache Spatie). Bila permission-nya tidak ada di database, route
 * dibiarkan lewat — mencegah lockout untuk aksi yang memang belum diberi permission
 * (mis. "delete ads nasional" yang tidak ada di production). Super-admin lolos
 * otomatis karena diberi semua permission.
 */
class EnforceRoutePermission
{
    /** Aksi resource → verb permission. */
    private const VERBS = [
        'index' => 'view',
        'show' => 'view',
        'create' => 'create',
        'store' => 'create',
        'edit' => 'edit',
        'update' => 'edit',
        'destroy' => 'delete',
    ];

    /** Basis nama route (tanpa "admin." dan tanpa aksi) → resource permission. */
    private const RESOURCES = [
        // Master
        'news' => 'news master',
        'users' => 'users master',
        'roles' => 'role master',
        'permissions' => 'permission master',
        'writers' => 'penulis master',
        'editors' => 'editor master',
        // Nasional
        'nasional.news' => 'news nasional',
        'nasional.kanal' => 'kanal nasional',
        'nasional.fokus' => 'fokus nasional',
        'nasional.fotografi' => 'gallery nasional',
        'nasional.ekoran' => 'ekoran nasional',
        'nasional.writer' => 'penulis nasional',
        'nasional.editor' => 'editor nasional',
        'nasional.ads' => 'ads nasional',
        'nasional.page-static' => 'page static nasional',
        // Daerah
        'daerah.news' => 'news daerah',
        'daerah.kanal' => 'kanal daerah',
        'daerah.fokus' => 'fokus daerah',
        'daerah.network' => 'network daerah',
        'daerah.writer' => 'penulis daerah',
        'daerah.editor' => 'editor daerah',
        'daerah.ads' => 'ads daerah',
        'daerah.adsLocate' => 'ads daerah location',
        // AJP
        'ajp.news' => 'news ajp',
        'ajp.writer' => 'member ajp',
        'ajp.paket' => 'paket ajp',
        'ajp.pengumuman' => 'pengumuman ajp',
        'ajp.transaction' => 'transaction ajp',
        'ajp.addon-requests' => 'addon-requests ajp',
        // Kopi Times
        'kopi-times.news' => 'news kopi-times',
        'kopi-times.writer' => 'member kopi-times',
        'kopi-times.pengumuman' => 'pengumuman kopi-times',
        'kopi-times.paket' => 'paket kopi-times',
        'kopi-times.events' => 'event kopi-times',
        'kopi-times.transaction' => 'transaction kopi-times',
        'kopi-times.addon-requests' => 'addon-requests kopi-times',
    ];

    /** Route non-CRUD yang punya permission spesifik (nama penuh tanpa "admin."). */
    private const OVERRIDES = [
        'news.import.daerah' => 'import daerah news master',
        'news.import.daerah.store' => 'import daerah news master',
        'news.import.nasional' => 'import nasional news master',
        'news.import.nasional.store' => 'import nasional news master',
        'history.index' => 'view history',
        // Report (index + semua export digerbang oleh satu permission per halaman)
        'nasional.news.download' => 'download json news nasional',
        'nasional.news.report.index' => 'view report news nasional',
        'nasional.news.report.export' => 'view report news nasional',
        'nasional.news.report.export-top-news' => 'view report news nasional',
        'nasional.news.report.export-top-category' => 'view report news nasional',
        'daerah.news.report.index' => 'view report news daerah',
        'daerah.news.report.export' => 'view report news daerah',
        'nasional.fotografi.report.index' => 'view report gallery nasional',
        'nasional.fotografi.report.export' => 'view report gallery nasional',
        'ajp-export.index' => 'export ajp',
        'ajp-export.create' => 'export ajp',
        'ajp-export.store' => 'export ajp',
        'nasional.fotografi.images.store' => 'create gallery nasional',
        'nasional.fotografi.images.destroy' => 'delete gallery nasional',
        'ajp.news.publish' => 'publish news ajp',
        'ajp.news.publish.store' => 'publish news ajp',
        'kopi-times.news.publish' => 'publish news kopi-times',
        'kopi-times.news.publish.store' => 'publish news kopi-times',
        'kopi-times.news.download' => 'download json news kopi-times',
        'kopi-times.events.toggle' => 'edit event kopi-times',
        'kopi-times.events.submissions' => 'view event kopi-times',
        'kopi-times.shipments.index' => 'view merchandise kopi-times',
    ];

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $name = $request->route()?->getName();

        if ($user && $name && str_starts_with($name, 'admin.')) {
            $permission = $this->permissionFor(substr($name, 6));

            if ($permission !== null
                && $this->permissionExists($permission)
                && ! $user->can($permission)) {
                abort(403, 'Anda tidak memiliki akses untuk tindakan ini.');
            }
        }

        return $next($request);
    }

    /** Petakan nama route (tanpa "admin.") ke permission, atau null bila tak diatur. */
    public function permissionFor(string $name): ?string
    {
        if (isset(self::OVERRIDES[$name])) {
            return self::OVERRIDES[$name];
        }

        $pos = strrpos($name, '.');
        if ($pos === false) {
            return null;
        }

        $base = substr($name, 0, $pos);
        $action = substr($name, $pos + 1);

        if (isset(self::RESOURCES[$base], self::VERBS[$action])) {
            return self::VERBS[$action] . ' ' . self::RESOURCES[$base];
        }

        return null;
    }

    /** True bila permission terdaftar (pakai cache Spatie, sinkron otomatis). */
    private function permissionExists(string $permission): bool
    {
        return app(PermissionRegistrar::class)
            ->getPermissions()
            ->contains('name', $permission);
    }
}
