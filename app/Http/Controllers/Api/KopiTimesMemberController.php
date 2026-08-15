<?php

namespace App\Http\Controllers\Api;

use App\Enum\WriterBerbayarType;
use App\Http\Controllers\Controller;
use App\Models\WriterBerbayar;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class KopiTimesMemberController extends Controller
{
    /**
     * List / cari member Kopi Times (wartawan berbayar type=KT).
     *
     * Query params (semua opsional, digabung dengan AND):
     *   q_name     : cocokkan nama / email
     *   q_instansi : cocokkan instansi / city
     *   active     : bila truthy, hanya member dengan langganan aktif (dateexp >= hari ini)
     *   status     : filter status (exact)
     *   per_page   : jumlah per halaman (default 15, maks 100)
     */
    #[OA\Get(
        path: '/api/kopi-times/members',
        tags: ['Kopi Times'],
        summary: 'List / cari member Kopi Times',
        description: 'Wartawan berbayar dengan type=KT.',
        security: [['apiKey' => []]],
        parameters: [
            new OA\Parameter(name: 'q_name', in: 'query', required: false, description: 'Cocokkan nama / email', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'q_instansi', in: 'query', required: false, description: 'Cocokkan instansi / city', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'active', in: 'query', required: false, description: 'Truthy: hanya langganan aktif (dateexp >= hari ini)', schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'status', in: 'query', required: false, description: 'Filter status (exact)', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, description: 'Item per halaman (default 15, maks 100)', schema: new OA\Schema(type: 'integer', default: 15, maximum: 100)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar member KT (paginasi Laravel standar)',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'current_page', type: 'integer', example: 1),
                    new OA\Property(property: 'per_page', type: 'integer', example: 15),
                    new OA\Property(property: 'total', type: 'integer', example: 30),
                    new OA\Property(property: 'data', type: 'array', items: new OA\Items(properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 9),
                        new OA\Property(property: 'nama', type: 'string', example: 'Budi Santoso'),
                        new OA\Property(property: 'email', type: 'string', example: 'budi@example.com'),
                        new OA\Property(property: 'city', type: 'string', example: 'Malang'),
                        new OA\Property(property: 'prov', type: 'string', example: 'Jawa Timur'),
                        new OA\Property(property: 'instansi', type: 'string', example: '...'),
                        new OA\Property(property: 'kategori', type: 'string', example: '...'),
                        new OA\Property(property: 'type_label', type: 'string', example: 'KT'),
                        new OA\Property(property: 'is_active_subscriber', type: 'boolean', example: true),
                        new OA\Property(property: 'dateexp', type: 'string', example: '2026-12-31'),
                        new OA\Property(property: 'quota_news', type: 'integer', example: 10),
                        new OA\Property(property: 'status', type: 'integer', example: 1),
                    ])),
                ])
            ),
            new OA\Response(response: 401, description: 'Belum terautentikasi'),
        ]
    )]
    public function index(Request $request)
    {
        $perPage = min(100, max(1, $request->integer('per_page', 15)));

        $members = WriterBerbayar::query()
            ->where('type', WriterBerbayarType::KT->value)
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->boolean('active'), fn ($q) => $q
                ->whereNotNull('dateexp')
                ->whereDate('dateexp', '>=', now()->toDateString()))
            ->when($request->filled('q_name'), function ($q) use ($request) {
                $name = $request->q_name;
                $q->where(fn ($q) => $q
                    ->where('nama', 'like', "%{$name}%")
                    ->orWhere('email', 'like', "%{$name}%"));
            })
            ->when($request->filled('q_instansi'), function ($q) use ($request) {
                $instansi = $request->q_instansi;
                $q->where(fn ($q) => $q
                    ->where('instansi', 'like', "%{$instansi}%")
                    ->orWhere('city', 'like', "%{$instansi}%"));
            })
            ->orderBy('nama')
            ->paginate($perPage)
            ->withQueryString();

        $members->through(fn (WriterBerbayar $m) => [
            'id' => $m->id,
            'nama' => $m->nama,
            'email' => $m->email,
            'city' => $m->city,
            'prov' => $m->prov,
            'instansi' => $m->instansi,
            'kategori' => $m->kategori,
            'type_label' => $m->type_label,
            'is_active_subscriber' => $m->is_active_subscriber,
            'dateexp' => $m->dateexp,
            'quota_news' => $m->quota_news,
            'status' => $m->status,
        ]);

        return response()->json($members);
    }
}
