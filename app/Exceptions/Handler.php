<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Throwable;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (PostTooLargeException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Ukuran file terlalu besar. Maksimal 8MB.'
                ], 413);
            }

            return back()->withErrors([
                'file' => 'Ukuran file terlalu besar. Maksimal 8MB.'
            ]);
        });
    }
}