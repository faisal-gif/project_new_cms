<?php

use App\Http\Controllers\AdsDaerahController;
use App\Http\Controllers\AdsLocateController;
use App\Http\Controllers\EditorController;
use App\Http\Controllers\FokusController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\KanalController;
use App\Http\Controllers\NetworkController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WriterController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('kanal', KanalController::class);
    Route::resource('network', NetworkController::class);
    Route::resource('history', HistoryController::class);
    Route::resource('fokus', FokusController::class);
    Route::resource('writer', WriterController::class);
    Route::resource('editor', EditorController::class);
    Route::resource('ads/daerah/locate', AdsLocateController::class)->names('ads.locate');
    Route::resource('ads/daerah/list',AdsDaerahController::class)->names('ads.daerah');
});

require __DIR__ . '/auth.php';
