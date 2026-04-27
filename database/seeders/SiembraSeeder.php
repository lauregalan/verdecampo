<?php

namespace Database\Seeders;

use App\Models\Campania;
use App\Models\Siembra;
use Illuminate\Database\Seeder;

class SiembraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $siembras = [
            [
                'campania' => 'Fina 2025',
                'lote' => 'Lote Norte',
                'fecha_siembra' => '2025-05-16',
                'observaciones' => 'Siembra de trigo en fecha óptima con buena humedad inicial y cobertura uniforme.',
            ],
        ];

        foreach ($siembras as $data) {
            $campania = Campania::query()
                ->with(['lotes', 'cultivo'])
                ->where('nombre', $data['campania'])
                ->firstOrFail();

            $lote = $campania->lotes
                ->firstWhere('nombre', $data['lote']);

            if (! $lote || ! $campania->cultivo_id) {
                continue;
            }

            Siembra::query()->updateOrCreate(
                [
                    'campania_id' => $campania->id,
                    'lote_id' => $lote->id,
                    'cultivo_id' => $campania->cultivo_id,
                    'fecha_siembra' => $data['fecha_siembra'],
                ],
                [
                    'observaciones' => $data['observaciones'],
                ],
            );
        }
    }
}
