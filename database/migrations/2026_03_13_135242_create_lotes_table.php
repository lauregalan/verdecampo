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
        Schema::create('lotes', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nombre');
            $table->string('caracteristicas');
            $table->string('estado');
            $table->float('longitud');
            $table->float('latitud');
            $table->float('ph');
            $table->float('napa');
            $table->unsignedBigInteger('id_campania');
            //$table->foreign('id_campania')->references('id')->on('campanias');
            $table->unsignedBigInteger('id_campo');
            $table->foreign('id_campo')->references('id')->on('campos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lotes');
    }
};
