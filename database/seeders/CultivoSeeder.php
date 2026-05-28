<?php

namespace Database\Seeders;

use App\Models\Campania;
use App\Models\Cultivo;
use Illuminate\Database\Seeder;

class CultivoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cultivos = [
            [
                'tipo' => 'Trigo',
                'variedad' => 'Baguette 620',
                'notas' => 'Paquete orientado a alta produccion en planteos de fina sobre ambientes de buen potencial.',
            ],
            [
                'tipo' => 'Cebada',
                'variedad' => 'Andreia',
                'notas' => 'Material con buen perfil cervecero para lotes de loma y seguimiento sanitario temprano.',
            ],
            [
                'tipo' => 'Soja',
                'variedad' => 'DM 46R18 STS',
                'notas' => 'Variedad de ciclo intermedio pensada para planteos de segunda con buena cobertura.',
            ],
            [
                'tipo' => 'Maiz',
                'variedad' => 'DK 72-72 VT3P',
                'notas' => 'Hibrido para ambientes de alto techo con estrategia defensiva frente a excesos hidricos.',
            ],
        ];

        $cultivoIds = [];

        foreach ($cultivos as $data) {
            $cultivo = Cultivo::query()->updateOrCreate(
                [
                    'tipo' => $data['tipo'],
                    'variedad' => $data['variedad'],
                ],
                [
                    'notas' => $data['notas'],
                ],
            );

            $cultivoIds[$data['tipo'].'|'.$data['variedad']] = $cultivo->id;
        }

        $campaniasCultivo = [
            'Fina 2025' => 'Trigo|Baguette 620',
            'Gruesa 2025/2026' => 'Soja|DM 46R18 STS',
            'Fina 2026' => 'Trigo|Baguette 620',
            'Gruesa 2025/2026 Oeste' => 'Maiz|DK 72-72 VT3P',
            'Fina 2024' => 'Trigo|Baguette 620',
        ];

        foreach ($campaniasCultivo as $campaniaNombre => $cultivoKey) {
            Campania::query()
                ->where('nombre', $campaniaNombre)
                ->update(['cultivo_id' => $cultivoIds[$cultivoKey]]);
        }
    }
}
