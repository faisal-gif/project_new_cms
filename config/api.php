<?php

return [
    /*
    |--------------------------------------------------------------------------
    | API Key
    |--------------------------------------------------------------------------
    | Kunci statis untuk autentikasi endpoint API internal. Diisi dari .env
    | (API_KEY). Klien wajib mengirim header: X-API-KEY: <nilai>.
    | Kosong = semua request ditolak (fail-closed).
    */
    'key' => env('API_KEY'),
];
