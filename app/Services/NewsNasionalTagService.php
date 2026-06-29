<?php

namespace App\Services;

use App\Models\TagsNasional;
use Illuminate\Support\Str;

class NewsNasionalTagService
{

    /**
     * Menghapus link HTML tag dan mengembalikannya menjadi teks biasa.
     */
    private function stripTagLinks(string $content): string
    {
        // Regex untuk mencari tag <a> yang menuju ke URL tag timesindonesia
        // dan mengambil kata di dalamnya ($1)
        $pattern = '/<a href="https:\/\/timesindonesia\.co\.id\/tag\/[^"\r\n]*"[^>]*>(.*?)<\/a>/si';

        return preg_replace($pattern, '$1', $content);
    }

    /**
     * Create a new class instance.
     */
    public function processTags(?array $tags, ?string $content): array
    {
        $syncData = [];
        $tagNames = [];
        $processedContent = $content ? $this->stripTagLinks($content) : '';

        // Jika tidak ada tag, langsung kembalikan default kosong
        if (empty($tags)) {
            return [
                'content'   => $processedContent,
                'syncData'  => $syncData,
                'tagString' => null,
            ];
        }

        $uniqueTags = [];

        // a. Normalisasi & Hapus Duplikasi (Mempertahankan Index Asli)
        foreach ($tags as $index => $tagName) {
            $cleanTagName = strtolower(trim($tagName));
            if (in_array($cleanTagName, $uniqueTags)) {
                continue;
            }
            $uniqueTags[$index] = $cleanTagName;
        }

        // b. Eksekusi Auto-Link (Sortir dari tag terpanjang ke terpendek)
        $tagsForLink = $uniqueTags;
        usort($tagsForLink, function ($a, $b) {
            return strlen($b) - strlen($a);
        });

        foreach ($tagsForLink as $cleanTagName) {
            $pattern = '/(?!(?:[^<]+>|[^>]+<\/a>))\b(' . preg_quote($cleanTagName, '/') . ')\b/iu';
            $tagSlug = Str::slug($cleanTagName);
            $tagUrl  = 'https://timesindonesia.co.id/tag/' . $tagSlug;

            $replacement = '<a href="' . $tagUrl . '" class="text-blue-600 hover:underline font-semibold" title="Baca lebih lanjut tentang $1">$1</a>';

            $processedContent = preg_replace($pattern, $replacement, $processedContent, 1);
        }

        // c. Simpan / Ambil dari Database & Siapkan Data Pivot
        foreach ($uniqueTags as $originalIndex => $cleanTagName) {
            $tagNames[] = $cleanTagName;

            $tag = TagsNasional::on('mysql_nasional')->firstOrCreate([
                'name' => $cleanTagName
            ]);

            $syncData[$tag->id] = ['sort_order' => $originalIndex];
        }

        return [
            'content'   => $processedContent,
            'syncData'  => $syncData,
            'tagString' => implode(',', $tagNames),
        ];
    }
}
