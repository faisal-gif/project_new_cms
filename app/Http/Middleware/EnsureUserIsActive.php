<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsActive
{
    /**
     * Logout user yang sedang login begitu status akunnya bukan '1' (aktif),
     * mis. dinonaktifkan/di-banned admin saat sesinya masih berjalan.
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && (string) Auth::user()->status !== '1') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda dinonaktifkan. Silakan hubungi administrator.',
            ]);
        }

        return $next($request);
    }
}
