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
        if (! Schema::hasColumn('lotes', 'id_campania')) {
            return;
        }

        Schema::table('lotes', function (Blueprint $table) {
            $table->dropColumn('id_campania');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('lotes', 'id_campania')) {
            return;
        }

        Schema::table('lotes', function (Blueprint $table) {
            $table->unsignedBigInteger('id_campania')->nullable()->after('napa');
        });
    }
};
