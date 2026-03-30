<?php

namespace Database\Seeders;

use App\Models\Campo;
use Illuminate\Database\Seeder;

class CampoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campos = [
            [
                'nombre' => 'Estancia La Esperanza',
                'latitud' => '-33.9021',
                'longitud' => '-60.5738',
                'hectareas' => 420,
            ],
            [
                'nombre' => 'Don Ricardo',
                'latitud' => '-33.7465',
                'longitud' => '-61.9694',
                'hectareas' => 315,
            ],
            [
                'nombre' => 'Los Aromos',
                'latitud' => '-37.8468',
                'longitud' => '-58.2579',
                'hectareas' => 280,
            ],
        ];

        foreach ($campos as $campo) {
            Campo::query()->updateOrCreate(
                ['nombre' => $campo['nombre']],
                $campo,
            );
        }
    }
}
