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
        Schema::create('network', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('domain');
            $table->string('slug')->index()->nullable();
            $table->string('title');
            $table->string('tagline');
            $table->text('description');
            $table->string('keyword');
            $table->string('logo')->nullable();
            $table->string('logo_m')->nullable();
            $table->string('img_socmed')->nullable();
            $table->string('analytics')->nullable();
            $table->string('gverify')->nullable();
            $table->string('fb')->nullable();
            $table->string('tw')->nullable();
            $table->string('ig')->nullable();
            $table->string('yt')->nullable();
            $table->string('gp')->nullable();
            $table->enum('is_main', [0, 1])->comment('0 = Iya, 1 = Tidak');
            $table->enum('is_web', [0, 1])->comment('0 = OFF, 1 = ON');
            $table->enum('status', [0, 1])->comment('0 = Pending, 1 = Publish');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('networks');
    }
};
