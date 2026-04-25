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
            [
                'campania' => 'Fina 2025',
                'lote' => 'Lote Molino',
                'fecha_siembra' => '2025-05-18',
                'observaciones' => 'Implantación pareja luego de una labor liviana de acondicionamiento.',
            ],
            [
                'campania' => 'Gruesa 2025/2026',
                'lote' => 'Lote Norte',
                'fecha_siembra' => '2025-10-07',
                'observaciones' => 'Siembra de soja de primera con buen cierre de surco y residual previo incorporado.',
            ],
            [
                'campania' => 'Gruesa 2025/2026',
                'lote' => 'Lote Bajo',
                'fecha_siembra' => '2025-10-10',
                'observaciones' => 'Se demoró unos días por exceso de humedad en las partes bajas del lote.',
            ],
            [
                'campania' => 'Fina 2026',
                'lote' => 'Lote Molino',
                'fecha_siembra' => '2026-05-20',
                'observaciones' => 'Planteo de fina con fertilización de arranque y semilla tratada.',
            ],
            [
                'campania' => 'Fina 2026',
                'lote' => 'Lote Bajo',
                'fecha_siembra' => '2026-05-23',
                'observaciones' => 'Densidad ajustada por ambiente con menor potencial y napa más cercana.',
            ],
            [
                'campania' => 'Gruesa 2025/2026 Oeste',
                'lote' => 'Lote Ruta 8',
                'fecha_siembra' => '2025-09-28',
                'observaciones' => 'Maíz temprano implantado con buena temperatura de suelo y alta uniformidad.',
            ],
            [
                'campania' => 'Gruesa 2025/2026 Oeste',
                'lote' => 'Lote Canada Honda',
                'fecha_siembra' => '2025-10-01',
                'observaciones' => 'Siembra realizada luego de barbecho limpio y perfil con buena recarga.',
            ],
            [
                'campania' => 'Fina 2024',
                'lote' => 'Lote La Curva',
                'fecha_siembra' => '2024-05-22',
                'observaciones' => 'Trigo implantado como planteo de seguimiento cercano al casco.',
            ],
            [
                'campania' => 'Papa 2025/2026',
                'lote' => 'Lote Sierra Chica',
                'fecha_siembra' => '2025-08-29',
                'observaciones' => 'Plantación de papa con control fino de profundidad y distanciamiento entre líneas.',
            ],
            [
                'campania' => 'Cobertura Invierno 2026',
                'lote' => 'Lote El Ombu',
                'fecha_siembra' => '2026-06-14',
                'observaciones' => 'Cobertura sembrada para mejorar estructura y competir contra malezas de invierno.',
            ],
            [
                'campania' => 'Cobertura Invierno 2026',
                'lote' => 'Lote Laguna',
                'fecha_siembra' => '2026-06-16',
                'observaciones' => 'Implantación algo más superficial por condición fría y húmeda del lote.',
            ],
            [
                'campania' => 'Ensayo Tardio 2025',
                'lote' => 'Lote Laguna',
                'fecha_siembra' => '2025-11-11',
                'observaciones' => 'Siembra de ensayo en baja escala para comparar comportamiento en ambiente restrictivo.',
            ],
        ];

        foreach ($siembras as $data) {
            $campania = Campania::query()
                ->with(['lotes', 'cultivo'])
                ->where('nombre', $data['campania'])
                ->firstOrFail();

            $lote = $campania->lotes
                ->firstWhere('nombre', $data['lote']);

            if (!$lote || !$campania->cultivo_id) {
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
