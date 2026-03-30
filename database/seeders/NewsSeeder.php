<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use Carbon\Carbon;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Menggunakan Faker dengan locale Indonesia (opsional)
        $faker = Faker::create('id_ID');

        // 1. Seed data untuk tabel 'tags'
        $tags = ['Teknologi', 'Bisnis', 'Olahraga', 'Kesehatan', 'Hiburan', 'Sains'];
        $tagIds = [];
        
        foreach ($tags as $tag) {
            $tagIds[] = DB::table('tags')->insertGetId([
                'name' => $tag,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 2. Seed data untuk 'news', 'news_tags', dan 'news_images'
        for ($i = 0; $i < 20; $i++) {
            // Asumsi: Kita menggunakan writer_id antara 1 sampai 5.
            // PASTIKAN tabel 'writers' sudah memiliki data dengan ID ini!
            $writerId = $faker->numberBetween(1, 5); 

            // Insert News
            $newsId = DB::table('news')->insertGetId([
                'is_code' => Str::random(10), // Maksimal 10 karakter dan unique
                'title' => $faker->sentence(6),
                'description' => $faker->text(255),
                'content' => $faker->text(2000), // longText
                'writer_id' => $writerId,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            // 3. Insert ke tabel pivot 'news_tags'
            // Ambil 1 sampai 3 tag secara acak untuk setiap berita
            $randomTagIds = $faker->randomElements($tagIds, $faker->numberBetween(1, 3));
            foreach ($randomTagIds as $tagId) {
                DB::table('news_tags')->insert([
                    'news_id' => $newsId,
                    'tag_id' => $tagId,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }

            // 4. Insert ke tabel 'news_images'
            DB::table('news_images')->insert([
                'news_id' => $newsId,
                'writer_id' => $writerId, // Menggunakan writer_id yang sama dengan penulis berita
                'image_url' => $faker->imageUrl(800, 600, 'news', true),
                'image_url_2' => $faker->optional(0.5)->imageUrl(800, 600, 'news', true), // 50% kemungkinan null
                'image_url_3' => $faker->optional(0.3)->imageUrl(800, 600, 'news', true), // 30% kemungkinan null
                'caption' => $faker->sentence(4),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}