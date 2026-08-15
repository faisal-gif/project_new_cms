<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsBerbayar;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class KopiTimesNewsController extends Controller
{
    /**
     * List berita Kopi Times (news berbayar type=4).
     *
     * Query params (semua opsional, digabung dengan AND):
     *   q_title   : cocokkan judul KT / is_code
     *   q_member  : cocokkan nama / email member
     *   member    : filter pewarta_id (exact)
     *   status    : filter status (exact)
     *   per_page  : jumlah per halaman (default 15, maks 100)
     *
     * Tiap item menyertakan data member dan berita nasional terkait
     * (link, judul, deskripsi, body) yang ditarik dari NewsNasional via is_code.
     */
    #[OA\Get(
        path: '/api/kopi-times/news',
        tags: ['Kopi Times'],
        summary: 'List / cari berita Kopi Times',
        description: 'Berita berbayar type=KT, menyertakan data member dan berita nasional terkait (link, judul, deskripsi, body).',
        security: [['apiKey' => []]],
        parameters: [
            new OA\Parameter(name: 'q_title', in: 'query', required: false, description: 'Cocokkan judul KT / is_code', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'q_member', in: 'query', required: false, description: 'Cocokkan nama / email member', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'member', in: 'query', required: false, description: 'Filter pewarta_id (exact)', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'status', in: 'query', required: false, description: 'Filter status (exact)', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, description: 'Item per halaman (default 15, maks 100)', schema: new OA\Schema(type: 'integer', default: 15, maximum: 100)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar berita KT (paginasi Laravel standar)',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'current_page', type: 'integer', example: 1),
                    new OA\Property(property: 'per_page', type: 'integer', example: 15),
                    new OA\Property(property: 'total', type: 'integer', example: 42),
                    new OA\Property(property: 'data', type: 'array', items: new OA\Items(properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 123),
                        new OA\Property(property: 'is_code', type: 'string', example: 'KT-xxxx'),
                        new OA\Property(property: 'status', type: 'integer', example: 1),
                        new OA\Property(property: 'datepub', type: 'string', example: '2026-08-15 10:00:00'),
                        new OA\Property(property: 'title', type: 'string', nullable: true, example: 'Judul Nasional'),
                        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Deskripsi...'),
                        new OA\Property(property: 'body', type: 'string', nullable: true, example: '<p>Isi konten...</p>'),
                        new OA\Property(property: 'link', type: 'string', nullable: true, example: 'https://timesindonesia.co.id/kanal-slug/45678/judul-berita'),
                        new OA\Property(property: 'member', type: 'object', nullable: true, properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 9),
                            new OA\Property(property: 'nama', type: 'string', example: 'Nama Pewarta'),
                            new OA\Property(property: 'email', type: 'string', example: 'pewarta@example.com'),
                        ]),
                    ])),
                ])
            ),
            new OA\Response(response: 401, description: 'Belum terautentikasi'),
        ]
    )]
    public function index(Request $request)
    {
        $perPage = min(100, max(1, $request->integer('per_page', 15)));

        $news = NewsBerbayar::query()
            ->where('type', 4)
            ->with([
                'writer:id,nama,email',
                // Kolom nasional yang dibutuhkan + kanal untuk membangun link publik.
                'newsNasional' => fn ($q) => $q
                    ->select('news_id', 'is_code', 'catnews_id', 'news_title', 'news_description', 'news_content', 'news_status')
                    ->with('kanal:catnews_id,catnews_slug'),
            ])
            ->when($request->filled('member'), fn ($q) => $q->where('pewarta_id', $request->member))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('q_title'), function ($q) use ($request) {
                $title = $request->q_title;
                $q->where(fn ($q) => $q
                    ->where('title', 'like', "%{$title}%")
                    ->orWhere('is_code', 'like', "%{$title}%"));
            })
            ->when($request->filled('q_member'), fn ($q) => $q
                ->whereHas('writer', fn ($w) => $w
                    ->where('nama', 'like', "%{$request->q_member}%")
                    ->orWhere('email', 'like', "%{$request->q_member}%")))
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $news->through(fn (NewsBerbayar $item) => [
            'id' => $item->id,
            'is_code' => $item->is_code,
            'status' => $item->status,
            'datepub' => $item->datepub,
            // Judul/deskripsi/isi diambil dari berita nasional terkait (via is_code).
            'title' => $item->newsNasional?->news_title,
            'description' => $item->newsNasional?->news_description,
            'body' => $item->newsNasional?->news_content,
            'link' => $item->newsNasional ? $this->nasionalLink($item->newsNasional) : null,
            'member' => $item->writer ? [
                'id' => $item->writer->id,
                'nama' => $item->writer->nama,
                'email' => $item->writer->email,
            ] : null,
        ]);

        return response()->json($news);
    }

    /** Link publik berita nasional; null bila belum terbit atau kanal tak punya slug. */
    private function nasionalLink($nasional): ?string
    {
        if ((int) $nasional->news_status !== 1 || ! $nasional->kanal?->catnews_slug) {
            return null;
        }

        return 'https://timesindonesia.co.id/'
            . $nasional->kanal->catnews_slug . '/'
            . $nasional->news_id . '/'
            . Str::slug($nasional->news_title);
    }
}
