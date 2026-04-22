<?php

use App\Http\Controllers\AdsDaerahController;
use App\Http\Controllers\AdsLocateController;
use App\Http\Controllers\EditorController;
use App\Http\Controllers\EditorDaerahController;
use App\Http\Controllers\EditorNasionalController;
use App\Http\Controllers\EKoranController;
use App\Http\Controllers\FokusDaerahController;
use App\Http\Controllers\FokusNasionalController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\KanalDaerahController;
use App\Http\Controllers\KanalNasionalController;
use App\Http\Controllers\NetworkDaerahController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NewsDaerahController;
use App\Http\Controllers\NewsNasionalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WriterDaerahController;
use App\Http\Controllers\WriterNasionalController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::post('/upload-image', [EditorController::class, 'upload']);
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::resource('news', NewsController::class);
    Route::get('/news/import-daerah/{is_code}', [NewsController::class, 'importDaerah'])->name('news.import.daerah');
    Route::post('/news/import-daerah', [NewsController::class, 'importDaerahStore'])->name('news.import.daerah.store');
    Route::get('/news/import-nasional/{is_code}', [NewsController::class, 'importNasional'])->name('news.import.nasional');
    Route::post('/news/import-nasional', [NewsController::class, 'importNasionalStore'])->name('news.import.nasional.store');
    Route::resource('users', UserController::class);
    Route::resource('history', HistoryController::class);
    Route::prefix('daerah')->name('daerah.')->group(
        function () {
            Route::get('news/export', [NewsDaerahController::class, 'export'])->name('news.export');
            Route::resource('kanal', KanalDaerahController::class);
            Route::resource('network', NetworkDaerahController::class);
            Route::resource('news', NewsDaerahController::class);
            Route::resource('fokus', FokusDaerahController::class);
            Route::resource('writer', WriterDaerahController::class);
            Route::resource('editor', EditorDaerahController::class);
            Route::resource('ads/locate', AdsLocateController::class)->names('ads.locate');
            Route::resource('ads/list', AdsDaerahController::class)->names('ads.list');
        }
    );

    Route::prefix('nasional')->name('nasional.')->group(
        function () {
            Route::get('news/diagnoze', [NewsNasionalController::class, 'diagnose'])->name('news.diagnose');
            Route::get('news/export', [NewsNasionalController::class, 'export'])->name('news.export');
            Route::resource('news', NewsNasionalController::class);
            Route::resource('kanal', KanalNasionalController::class);
            Route::resource('fokus', FokusNasionalController::class);
            Route::resource('writer', WriterNasionalController::class);
            Route::resource('editor', EditorNasionalController::class);
            Route::resource('fotografi', GalleryController::class);
            Route::resource('ekoran', EKoranController::class);
        }
    );
});

require __DIR__ . '/auth.php';
