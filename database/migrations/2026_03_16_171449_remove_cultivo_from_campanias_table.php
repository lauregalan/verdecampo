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
        Schema::table('campanias', function (Blueprint $table) {
            $table->dropColumn(['cultivo', 'hectareas_sembradas']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campanias', function (Blueprint $table) {
            $table->string('cultivo')->nullable();
            $table->decimal('hectareas_sembradas', 10, 2)->nullable();
        });
    }
};
