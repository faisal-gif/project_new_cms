<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'TIN CMS API',
    description: 'API internal CMS (first-party, auth via sesi web).'
)]
#[OA\Server(url: '/', description: 'Server aplikasi (relatif terhadap host saat ini)')]
#[OA\Tag(name: 'Kopi Times', description: 'Berita & member Kopi Times')]
#[OA\SecurityScheme(
    securityScheme: 'apiKey',
    type: 'apiKey',
    in: 'header',
    name: 'X-API-KEY',
    description: 'API key statis dari .env (API_KEY). Kirim di header X-API-KEY.'
)]
abstract class Controller
{
    //
}
