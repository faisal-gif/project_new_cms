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

        if (empty($tags)) {
            return [
                'content'   => $processedContent,
                'syncData'  => $syncData,
                'tagString' => null,
            ];
        }
        
        $uniqueTags = [];
        foreach ($tags as $index => $tagName) {
            $cleanTagName = strtolower(trim($tagName));
            if (in_array($cleanTagName, $uniqueTags)) {
                continue;
            }
            $uniqueTags[$index] = $cleanTagName; 
        }

        $tagsForLink = $uniqueTags;
        usort($tagsForLink, function($a, $b) {
            return strlen($b) - strlen($a);
        });

        foreach ($tagsForLink as $cleanTagName) {
            $tagSlug = Str::slug($cleanTagName);
            $tagUrl  = 'https://timesindonesia.co.id/tag/' . $tagSlug;
            
            $pattern = '/(<figcaption\b[^>]*>.*?<\/figcaption>|<a\b[^>]*>.*?<\/a>|<[^>]+>)|(\b' . preg_quote($cleanTagName, '/') . '\b)/isu';
            
            $hasReplaced = false;

            $processedContent = preg_replace_callback($pattern, function($matches) use (&$hasReplaced, $tagUrl) {
                if (!empty($matches[1])) {
                    return $matches[0];
                }

                if (!empty($matches[2])) {
                    if ($hasReplaced) {
                        return $matches[0];
                    }
                    
                    $hasReplaced = true;
                    
                    return '<a href="' . $tagUrl . '" class="text-blue-600 hover:underline font-semibold" title="Baca lebih lanjut tentang ' . $matches[2] . '">' . $matches[2] . '</a>';
                }

                return $matches[0];
            }, $processedContent);
        }

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
