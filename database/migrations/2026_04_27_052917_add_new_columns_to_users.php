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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('editor_id')->after('role')->nullable()->constrained('editors')->onDelete('set null');
            $table->foreignId('writer_id')->after('editor_id')->nullable()->constrained('writers')->onDelete('set null');
            $table->bigInteger('id_fotografer')->after('writer_id')->nullable()->comment('ID untuk Fotografer');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['editor_id']);
            $table->dropForeign(['writer_id']);
            $table->dropColumn(['editor_id', 'writer_id', 'id_fotografer']);
        });
    }
};
