<?php

use App\Http\Controllers\Api\KopiTimesMemberController;
use App\Http\Controllers\Api\KopiTimesNewsController;
use App\Http\Middleware\EnsureApiKey;
use Illuminate\Support\Facades\Route;

// Endpoint API internal: auth via API key statis (header X-API-KEY, nilai dari .env).
Route::middleware(EnsureApiKey::class)->group(function () {
    Route::get('/kopi-times/news', [KopiTimesNewsController::class, 'index'])
        ->name('api.kopi-times.news.index');
    Route::get('/kopi-times/members', [KopiTimesMemberController::class, 'index'])
        ->name('api.kopi-times.members.index');
});
