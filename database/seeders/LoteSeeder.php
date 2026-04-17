<?php

namespace Database\Seeders;

use App\Models\Campo;
use App\Models\Lote;
use Illuminate\Database\Seeder;

class LoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lotesPorCampo = [
            'Estancia La Esperanza' => [
                [
                    'nombre' => 'Lote Norte',
                    'caracteristicas' => '95 ha. Suelo franco limoso, buen escurrimiento y ambiente de alto potencial.',
                    'estado' => 'produccion',
                    'latitud' => -33.8962,
                    'longitud' => -60.5791,
                    'hectareas' => 95,
                    'ph' => 6.3,
                    'napa' => 2.4,
                ],
                [
                    'nombre' => 'Lote Molino',
                    'caracteristicas' => '78 ha. Sector con loma suave, rotacion trigo/soja y baja limitacion hidrica.',
                    'estado' => 'barbecho',
                    'latitud' => -33.9084,
                    'longitud' => -60.5688,
                    'hectareas' => 78,
                    'ph' => 6.1,
                    'napa' => 2.8,
                ],
                [
                    'nombre' => 'Lote Bajo',
                    'caracteristicas' => '64 ha. Ambiente con mayor contenido de arcilla y riesgo de anegamiento en otonos lluviosos.',
                    'estado' => 'preparacion',
                    'latitud' => -33.9141,
                    'longitud' => -60.5826,
                    'hectareas' => 64,
                    'ph' => 5.9,
                    'napa' => 1.7,
                ],
            ],
            'Don Ricardo' => [
                [
                    'nombre' => 'Lote Ruta 8',
                    'caracteristicas' => '88 ha. Perfil profundo y uniforme, apto para maiz temprano y soja de primera.',
                    'estado' => 'produccion',
                    'latitud' => -33.7418,
                    'longitud' => -61.9622,
                    'hectareas' => 88,
                    'ph' => 6.5,
                    'napa' => 3.1,
                ],
                [
                    'nombre' => 'Lote Canada Honda',
                    'caracteristicas' => '71 ha. Ambiente mixto con sectores mas pesados y buen aporte de rastrojo.',
                    'estado' => 'produccion',
                    'latitud' => -33.7526,
                    'longitud' => -61.9758,
                    'hectareas' => 71,
                    'ph' => 6.0,
                    'napa' => 2.2,
                ],
                [
                    'nombre' => 'Lote La Curva',
                    'caracteristicas' => '54 ha. Cuadro cercano al casco, ideal para seguimiento y ensayos comparativos.',
                    'estado' => 'barbecho',
                    'latitud' => -33.7557,
                    'longitud' => -61.9586,
                    'hectareas' => 54,
                    'ph' => 6.2,
                    'napa' => 2.6,
                ],
            ],
            'Los Aromos' => [
                [
                    'nombre' => 'Lote Sierra Chica',
                    'caracteristicas' => '60 ha. Suelo franco arenoso, buena aptitud para papa y cultivos de servicio.',
                    'estado' => 'produccion',
                    'latitud' => -37.8424,
                    'longitud' => -58.2631,
                    'hectareas' => 60,
                    'ph' => 5.8,
                    'napa' => 1.9,
                ],
                [
                    'nombre' => 'Lote El Ombu',
                    'caracteristicas' => '52 ha. Sector bien drenado con historial de fina y cobertura invernal.',
                    'estado' => 'preparacion',
                    'latitud' => -37.8512,
                    'longitud' => -58.2498,
                    'hectareas' => 52,
                    'ph' => 6.0,
                    'napa' => 2.1,
                ],
                [
                    'nombre' => 'Lote Laguna',
                    'caracteristicas' => '47 ha. Lote frio de menor potencial, reservado para estrategias conservadoras.',
                    'estado' => 'barbecho',
                    'latitud' => -37.8554,
                    'longitud' => -58.2592,
                    'hectareas' => 47,
                    'ph' => 5.7,
                    'napa' => 1.5,
                ],
            ],
        ];

        foreach ($lotesPorCampo as $campoNombre => $lotes) {
            $campo = Campo::query()->where('nombre', $campoNombre)->firstOrFail();

            foreach ($lotes as $lote) {
                Lote::query()->updateOrCreate(
                    [
                        'campo_id' => $campo->id,
                        'nombre' => $lote['nombre'],
                    ],
                    $lote + ['campo_id' => $campo->id],
                );
            }
        }
    }
}
