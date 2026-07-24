<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdsDaerahController;
use App\Http\Controllers\AdsLocateController;
use App\Http\Controllers\AdsNasionalController;
use App\Http\Controllers\AJPController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EditorController;
use App\Http\Controllers\EditorDaerahController;
use App\Http\Controllers\EditorNasionalController;
use App\Http\Controllers\EKoranController;
use App\Http\Controllers\FokusDaerahController;
use App\Http\Controllers\FokusNasionalController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\KanalDaerahController;
use App\Http\Controllers\KanalNasionalController;
use App\Http\Controllers\KtAddonRequestController;
use App\Http\Controllers\MerchandiseShipmentKTController;
use App\Http\Controllers\NetworkDaerahController;
use App\Http\Controllers\NewsAJPController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NewsDaerahController;
use App\Http\Controllers\NewsKTController;
use App\Http\Controllers\NewsNasionalController;
use App\Http\Controllers\NewsNoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageStaticController;
use App\Http\Controllers\PaketAjpController;
use App\Http\Controllers\PaketKTController;
use App\Http\Controllers\PaymentsAjpController;
use App\Http\Controllers\PaymentsKTController;
use App\Http\Controllers\PengumumanKTController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportGalleryController;
use App\Http\Controllers\ReportNewsDaerahController;
use App\Http\Controllers\ReportNewsNasionalController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SsoController;
use App\Http\Controllers\TextEditorController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WriterAjpController;
use App\Http\Controllers\WriterController;
use App\Http\Controllers\WriterDaerahController;
use App\Http\Controllers\WriterKtController;
use App\Http\Controllers\WriterNasionalController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});
Route::get('/sso-login', [SsoController::class, 'handleSso'])->name('sso.login');
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::post('/upload-image', [TextEditorController::class, 'upload']);
Route::post('/upload-image-url', [TextEditorController::class, 'uploadFromUrl'])->name('editor.image.upload.url');
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::resource('news', NewsController::class)->only('index', 'create', 'show', 'store');
    Route::get('/news/import-daerah/{is_code}', [NewsController::class, 'importDaerah'])->name('news.import.daerah');
    Route::post('/news/import-daerah', [NewsController::class, 'importDaerahStore'])->name('news.import.daerah.store');
    Route::get('/news/import-nasional/{is_code}', [NewsController::class, 'importNasional'])->name('news.import.nasional');
    Route::post('/news/import-nasional', [NewsController::class, 'importNasionalStore'])->name('news.import.nasional.store');
    Route::get('/history', [ActivityLogController::class, 'index'])->name('history.index');
    Route::post('/news/{news}/notes', [NewsNoteController::class, 'store'])->name('news.notes.store');
    Route::resource('ajp-export', AJPController::class)->only('create', 'index', 'store');
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
    Route::resource('writers', WriterController::class);
    Route::resource('editors', EditorController::class);
    // Rute untuk membaca notifikasi lalu dialihkan ke halaman tujuan
    Route::get('/notifications/{id}/go', [NotificationController::class, 'open'])->name('notifications.go');
    Route::post('/notifications/clear', [NotificationController::class, 'clear'])->name('notifications.clear');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    Route::prefix('daerah')->name('daerah.')->group(
        function () {
            Route::get('news/report', [ReportNewsDaerahController::class, 'index'])->name('news.report.index');
            Route::post('news/export', [ReportNewsDaerahController::class, 'export'])->name('news.report.export');
            Route::resource('kanal', KanalDaerahController::class);
            Route::resource('network', NetworkDaerahController::class);
            Route::resource('news', NewsDaerahController::class);
            Route::resource('fokus', FokusDaerahController::class);
            Route::resource('writer', WriterDaerahController::class);
            Route::resource('editor', EditorDaerahController::class);
            Route::resource('ads', AdsDaerahController::class);
            Route::resource('adsLocate', AdsLocateController::class);
        }
    );

    Route::prefix('nasional')->name('nasional.')->group(
        function () {
            Route::get('news/diagnoze', [NewsNasionalController::class, 'diagnose'])->name('news.diagnose');
            Route::get('news/report', [ReportNewsNasionalController::class, 'index'])->name('news.report.index');
            Route::get('fotografi/report', [ReportGalleryController::class, 'index'])->name('fotografi.report.index');
            Route::post('news/export', [ReportNewsNasionalController::class, 'export'])->name('news.report.export');
            Route::post('news/export-top-news', [ReportNewsNasionalController::class, 'exportTopNews'])->name('news.report.export-top-news');
            Route::post('news/export-top-category', [ReportNewsNasionalController::class, 'exportTopCategory'])->name('news.report.export-top-category');
            Route::post('fotografi/export', [ReportGalleryController::class, 'export'])->name('fotografi.report.export');
            Route::get('tags/search', [NewsNasionalController::class, 'searchTags'])->name('tags.search');
            Route::resource('ads', AdsNasionalController::class);
            Route::resource('news', NewsNasionalController::class);
            Route::resource('kanal', KanalNasionalController::class);
            Route::resource('fokus', FokusNasionalController::class);
            Route::resource('writer', WriterNasionalController::class);
            Route::resource('editor', EditorNasionalController::class);
            Route::resource('fotografi', GalleryController::class);
            Route::resource('ekoran', EKoranController::class);
            Route::resource('page-static', PageStaticController::class);
        }
    );
    Route::prefix('ajp')->name('ajp.')->group(
        function () {
            Route::resource('transaction', PaymentsAjpController::class)->only('index');
            Route::resource('news', NewsAJPController::class);
            Route::get('/transaction/report', [PaymentsAjpController::class, 'report'])->name('transaction.report');
            Route::get('/news/publish/{id}', [NewsAJPController::class, 'publish'])->name('news.publish');
            Route::post('/news/publish/{id}/store', [NewsAJPController::class, 'publishStore'])->name('news.publish.store');
            Route::resource('writer', WriterAjpController::class);
            Route::resource('paket', PaketAjpController::class);
        }
    );

    Route::prefix('kopi-times')->name('kopi-times.')->group(
        function () {
            Route::resource('transaction', PaymentsKTController::class)->only('index');
            Route::resource('news', NewsKTController::class);
            Route::resource('writer', WriterKtController::class);
            Route::resource('pengumuman', PengumumanKTController::class);
            Route::resource('merchandise/shipments', MerchandiseShipmentKTController::class);
            Route::resource('paket', PaketKTController::class);
            Route::get('/transaction/report', [PaymentsKTController::class, 'report'])->name('transaction.report');
            Route::get('/news/publish/{id}', [NewsKTController::class, 'publish'])->name('news.publish');
            Route::get('/addon-requests', [KtAddonRequestController::class, 'index'])->name('addon-requests.index');
            Route::get('/addon-requests/{id}', [KtAddonRequestController::class, 'show'])->name('addon-requests.show');
            Route::put('/addon-requests/{id}', [KtAddonRequestController::class, 'update'])->name('addon-requests.update');
            Route::post('/news/publish/{isCode}/store', [NewsKTController::class, 'publishStore'])->name('news.publish.store');
        }
    );
});

require __DIR__ . '/auth.php';
