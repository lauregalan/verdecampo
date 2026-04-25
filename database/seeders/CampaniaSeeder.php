<?php

namespace Database\Seeders;

use App\Models\Campania;
use App\Models\Campo;
use Illuminate\Database\Seeder;

class CampaniaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campanias = [
            [
                'campo' => 'Estancia La Esperanza',
                'nombre' => 'Fina 2025',
                'fecha_inicio' => '2025-05-12',
                'fecha_fin' => '2025-11-28',
                'estado' => 'Finalizada',
            ],
            [
                'campo' => 'Estancia La Esperanza',
                'nombre' => 'Gruesa 2025/2026',
                'fecha_inicio' => '2025-10-01',
                'fecha_fin' => '2026-04-25',
                'estado' => 'En Curso',
            ],
            [
                'campo' => 'Estancia La Esperanza',
                'nombre' => 'Fina 2026',
                'fecha_inicio' => '2026-05-15',
                'fecha_fin' => '2026-11-30',
                'estado' => 'Planificada',
            ],
            [
                'campo' => 'Don Ricardo',
                'nombre' => 'Gruesa 2025/2026 Oeste',
                'fecha_inicio' => '2025-09-20',
                'fecha_fin' => '2026-04-18',
                'estado' => 'En Curso',
            ],
            [
                'campo' => 'Don Ricardo',
                'nombre' => 'Fina 2024',
                'fecha_inicio' => '2024-05-18',
                'fecha_fin' => '2024-11-22',
                'estado' => 'Finalizada',
            ],
            [
                'campo' => 'Los Aromos',
                'nombre' => 'Papa 2025/2026',
                'fecha_inicio' => '2025-08-25',
                'fecha_fin' => '2026-03-20',
                'estado' => 'En Curso',
            ],
            [
                'campo' => 'Los Aromos',
                'nombre' => 'Cobertura Invierno 2026',
                'fecha_inicio' => '2026-06-10',
                'fecha_fin' => '2026-09-15',
                'estado' => 'Planificada',
            ],
            [
                'campo' => 'Los Aromos',
                'nombre' => 'Ensayo Tardio 2025',
                'fecha_inicio' => '2025-11-05',
                'fecha_fin' => '2026-02-28',
                'estado' => 'Cancelada',
            ],
        ];

        foreach ($campanias as $data) {
            $campo = Campo::query()->where('nombre', $data['campo'])->firstOrFail();

            Campania::query()->updateOrCreate(
                [
                    'campo_id' => $campo->id,
                    'nombre' => $data['nombre'],
                ],
                [
                    'fecha_inicio' => $data['fecha_inicio'],
                    'fecha_fin' => $data['fecha_fin'],
                    'estado' => $data['estado'],
                ],
            );
        }
    }
}
