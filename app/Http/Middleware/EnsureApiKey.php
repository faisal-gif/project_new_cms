<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Autentikasi endpoint API internal lewat API key statis dari .env (config('api.key')).
 * Klien mengirim header: X-API-KEY: <nilai>. Perbandingan timing-safe; key kosong
 * di server = semua request ditolak (fail-closed).
 */
class EnsureApiKey
{
    public function handle(Request $request, Closure $next)
    {
        $expected = (string) config('api.key');
        $provided = (string) $request->header('X-API-KEY');

        if ($expected === '' || ! hash_equals($expected, $provided)) {
            abort(401, 'API key tidak valid.');
        }

        return $next($request);
    }
}
