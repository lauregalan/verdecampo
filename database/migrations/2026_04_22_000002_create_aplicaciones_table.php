<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aplicaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_aplicacion_id')->constrained('productos_aplicaciones')->cascadeOnDelete();
            $table->foreignId('tipo_aplicacion_id')->constrained('tipos_aplicaciones')->cascadeOnDelete();
            $table->foreignId('campania_id')->constrained('campanias')->cascadeOnDelete();
            $table->foreignId('lote_id')->constrained('lotes')->cascadeOnDelete();
            $table->decimal('cantidad', 10, 2);
            $table->string('unidad', 50);
            $table->date('fecha');
            $table->decimal('precio_labor', 12, 2);
            $table->string('moneda_precio_labor', 10);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aplicaciones');
    }
};
