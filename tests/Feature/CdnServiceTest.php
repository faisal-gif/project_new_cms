<?php

namespace Tests\Feature;

use App\Services\CdnService;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CdnServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config()->set('services.tin_cdn.url', 'https://cdn.test/api/v1');
        config()->set('services.tin_cdn.api_key', 'secret-key');
    }

    public function test_delete_null_id_short_circuits_without_calling_cdn(): void
    {
        Http::fake();
        $this->assertFalse((new CdnService)->delete(null));
        Http::assertNothingSent();
    }

    public function test_delete_hits_correct_endpoint_with_api_key(): void
    {
        Http::fake(['*' => Http::response(['success' => true], 200)]);

        $this->assertTrue((new CdnService)->delete('01JABC'));
        Http::assertSent(fn ($req) => $req->method() === 'DELETE'
            && $req->url() === 'https://cdn.test/api/v1/images/01JABC'
            && $req->hasHeader('x-api-key', 'secret-key'));
    }

    public function test_delete_returns_false_on_cdn_failure(): void
    {
        Http::fake(['*' => Http::response(['success' => false], 404)]);
        $this->assertFalse((new CdnService)->delete('01JABC'));
    }

    public function test_upload_captures_ulid_for_later_deletion(): void
    {
        Http::fake(['*' => Http::response(['data' => ['id' => '01JXYZ', 'url' => 'https://cdn.test/foo.webp']], 201)]);

        $svc = new CdnService;
        $url = $svc->uploadImage(File::image('foo.jpg'), 'foo', 3, 'convert', false);

        $this->assertSame('https://cdn.test/foo.webp', $url);
        $this->assertSame('01JXYZ', $svc->getLastUploadedId());
    }

    public function test_list_images_forwards_filters_and_returns_payload(): void
    {
        Http::fake(['*' => Http::response(['data' => [['id' => '1', 'url' => 'x']], 'meta' => ['last_page' => 2]], 200)]);

        $out = (new CdnService)->listImages(['search' => 'jokowi', 'category_slug' => 'news', 'page' => 2]);

        $this->assertCount(1, $out['data']);
        $this->assertSame(2, $out['meta']['last_page']);
        Http::assertSent(fn ($req) => str_starts_with($req->url(), 'https://cdn.test/api/v1/images')
            && $req['search'] === 'jokowi'
            && $req['category_slug'] === 'news'
            && $req->hasHeader('x-api-key', 'secret-key'));
    }

    public function test_list_images_returns_empty_structure_on_failure(): void
    {
        Http::fake(['*' => Http::response('nope', 500)]);
        $out = (new CdnService)->listImages([]);
        $this->assertSame([], $out['data']);
        $this->assertNull($out['meta']);
    }
}
