<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'tin_cdn' => [
        'url' => env('TIN_CDN_URL'),
        'api_key' => env('TIN_CDN_API_KEY'),
    ],

    // URL aplikasi publik (berbayar) — dipakai untuk merangkai link form kirim berita
    // publik: {url}/kirim-berita/{slug}. Dipisah per brand (KT & AJP). Fallback APP_URL.
    'berbayar' => [
        'kt_url'  => env('APP_PUBLIC_KT_URL', env('APP_URL')),
        'ajp_url' => env('APP_PUBLIC_AJP_URL', env('APP_URL')),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
