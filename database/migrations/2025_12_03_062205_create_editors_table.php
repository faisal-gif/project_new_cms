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
        Schema::create('editors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('user_id');
            $table->integer('id_ti')->unique()->nullable()->comment('ID di DB TI Pusat');
            $table->integer('id_daerah')->unique()->nullable()->comment('ID di DB Daerah');
            $table->enum('status', [0, 1])->comment('0 = Pending, 1 = Publish');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('editors');
    }
};
