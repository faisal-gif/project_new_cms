<?php

namespace Tests\Unit;

use App\Jobs\CrawlAffiliateLink;
use PHPUnit\Framework\TestCase;

class CrawlAffiliateLinkTest extends TestCase
{
    public function test_og_parses_both_attribute_orders(): void
    {
        $a = '<meta property="og:title" content="Sepatu Lari">';
        $b = '<meta content="Rp150.000" property="og:price">';
        $this->assertSame('Sepatu Lari', CrawlAffiliateLink::og($a, 'title'));
        $this->assertSame('Rp150.000', CrawlAffiliateLink::og($b, 'price'));
    }

    public function test_og_decodes_entities_and_returns_null_when_missing(): void
    {
        $html = "<meta property='og:title' content='Kaos &amp; Celana'>";
        $this->assertSame('Kaos & Celana', CrawlAffiliateLink::og($html, 'title'));
        $this->assertNull(CrawlAffiliateLink::og('<html></html>', 'image'));
    }
}
