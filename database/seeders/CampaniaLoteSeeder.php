<?php

namespace Database\Seeders;

use App\Models\Campania;
use App\Models\Campo;
use App\Models\Lote;
use Illuminate\Database\Seeder;

class CampaniaLoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $asignaciones = [
            'Estancia La Esperanza' => [
                'Fina 2025' => ['Lote Norte', 'Lote Molino'],
                'Gruesa 2025/2026' => ['Lote Norte', 'Lote Bajo'],
                'Fina 2026' => ['Lote Molino', 'Lote Bajo'],
            ],
            'Don Ricardo' => [
                'Gruesa 2025/2026 Oeste' => ['Lote Ruta 8', 'Lote Canada Honda'],
                'Fina 2024' => ['Lote La Curva'],
            ],
            'Los Aromos' => [
                'Papa 2025/2026' => ['Lote Sierra Chica'],
                'Cobertura Invierno 2026' => ['Lote El Ombu', 'Lote Laguna'],
                'Ensayo Tardio 2025' => ['Lote Laguna'],
            ],
        ];

        foreach ($asignaciones as $campoNombre => $campanias) {
            $campo = Campo::query()->where('nombre', $campoNombre)->firstOrFail();

            foreach ($campanias as $campaniaNombre => $loteNombres) {
                $campania = Campania::query()
                    ->where('campo_id', $campo->id)
                    ->where('nombre', $campaniaNombre)
                    ->firstOrFail();

                $loteIds = Lote::query()
                    ->where('id_campo', $campo->id)
                    ->whereIn('nombre', $loteNombres)
                    ->pluck('id');

                $campania->lotes()->syncWithoutDetaching($loteIds);
            }
        }
    }
}
