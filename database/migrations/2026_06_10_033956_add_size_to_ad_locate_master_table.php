<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Buat kolom width dan height bertipe integer
        Schema::connection('mysql_nasional')->table('ad_locate_master', function (Blueprint $table) {
            $table->integer('width')->nullable()->after('name');
            $table->integer('height')->nullable()->after('width');
        });

        // 2. Ekstraksi Data
        DB::connection('mysql_nasional')->table('ad_locate_master')->orderBy('id')->chunk(100, function ($ads) {
            foreach ($ads as $ad) {
                if (preg_match('/\((.*?)\)/', $ad->name, $matches)) {
                    // Ambil string pertama, contoh: "970x250 "
                    $rawSize = $matches[1];
                    $firstSize = trim(explode('/', $rawSize)[0]);

                    // Normalisasi menjadi huruf kecil (berjaga-jaga jika ada huruf 'X' kapital) 
                    // dan pecah berdasarkan 'x'
                    $dimensions = explode('x', strtolower($firstSize));

                    // Pastikan array memiliki tepat 2 elemen (width dan height)
                    if (count($dimensions) === 2) {
                        // Konversi menjadi tipe integer agar aman
                        $width = (int) trim($dimensions[0]);
                        $height = (int) trim($dimensions[1]);

                        // Update database
                        DB::connection('mysql_nasional')->table('ad_locate_master')
                            ->where('id', $ad->id)
                            ->update([
                                'width' => $width,
                                'height' => $height
                            ]);
                    }
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql_nasional')->table('ad_locate_master', function (Blueprint $table) {
            $table->dropColumn(['width', 'height']);
        });
    }
};
