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
        Schema::table('cultivos', function (Blueprint $table) {
            $table->dropForeign(['campania_id']);
            $table->dropForeign(['lote_id']);

            // Ahora sí podemos borrar las columnas
            $table->dropColumn(['campania_id', 'lote_id']);
        });

        Schema::table('campanias', function (Blueprint $table) {
            $table->foreignId('cultivo_id')
                ->nullable()
                ->after('id') // Opcional: para que quede al principio
                ->constrained('cultivos')
                ->onDelete('set null'); //si borras el cultivo, la campaña queda en null
    });
    }

    public function down(): void
    {
        //xd
    }
};
