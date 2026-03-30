<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('news_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('news_id');
            $table->unsignedBigInteger('writer_id');
            $table->string('image_url');
            $table->string('image_url_2')->nullable();
            $table->string('image_url_3')->nullable();
            $table->string('caption');
            $table->timestamps();

            $table->foreign('news_id')->references('id')->on('news')->onDelete('cascade');
            $table->foreign('writer_id')->references('id')->on('writers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_images');
    }
};
