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
        Schema::create('writers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('password');
            $table->string('no_whatsapp')->nullable();
            $table->date('date_exp')->nullable();
            $table->unsignedBigInteger('network_id');
            $table->integer('net_id')->nullable();
            $table->enum('status', ['0', '1'])->comment('0 = Pending, 1 = Publish');
            $table->unsignedBigInteger('editor_id')->nullable();

            $table->foreign('network_id')->references('id')->on('network')->onDelete('cascade');
            $table->foreign('editor_id')->references('id')->on('editors')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writers');
    }
};
