<?php

namespace Database\Seeders;

use App\Models\TipoAplicacion;
use Illuminate\Database\Seeder;

class TipoAplicacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Barbecho químico'],
            ['nombre' => 'Preemergencia'],
            ['nombre' => 'Postemergencia'],
            ['nombre' => 'Fertilización'],
            ['nombre' => 'Fungicida'],
            ['nombre' => 'Insecticida'],
            ['nombre' => 'Curasemilla'],
            ['nombre' => 'Aplicación foliar'],
        ];

        foreach ($tipos as $tipo) {
            TipoAplicacion::query()->updateOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo,
            );
        }
    }
}
