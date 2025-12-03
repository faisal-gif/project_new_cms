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
        Schema::create('news_fokus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('keyword');
            $table->string('img_desktop_list')->nullable();
            $table->string('img_desktop_news')->nullable();
            $table->string('img_mobile')->nullable();
            $table->enum('status', [0, 1])->comment('0 = Pending, 1 = Publish');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fokuses');
    }
};
