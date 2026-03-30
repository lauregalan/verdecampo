<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cultivos', function ($table) {
            $table->dropColumn('cultivo_antecesor');
            $table->dropColumn('fecha_siembra');
            $table->unsignedBigInteger('cultivo_antecesor_id')->nullable();

            $table->foreign('cultivo_antecesor_id')->references('id')->on('cultivos')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
