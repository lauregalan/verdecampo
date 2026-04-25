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
            [
                'tipo' => 'Trigo',
                'variedad' => 'ACA 360',
                'notas' => 'Material estable para fina con foco en proteina y sanidad de hoja.',
            ],
            [
                'tipo' => 'Maiz',
                'variedad' => 'NK 842 VIP3',
                'notas' => 'Material de maiz temprano para lotes profundos con respuesta a tecnologia.',
            ],
            [
                'tipo' => 'Trigo',
                'variedad' => 'Klein Valor',
                'notas' => 'Cultivar clasico de fina usado en lotes de seguimiento y comparativos.',
            ],
            [
                'tipo' => 'Papa',
                'variedad' => 'Spunta',
                'notas' => 'Cultivo intensivo con seguimiento de riego, sanidad y calidad comercial.',
            ],
            [
                'tipo' => 'Centeno',
                'variedad' => 'Quehuen INTA',
                'notas' => 'Cobertura de invierno para estructura del suelo y supresion de malezas.',
            ],
            [
                'tipo' => 'Vicia',
                'variedad' => 'Ascasubi',
                'notas' => 'Leguminosa de servicio pensada para aporte de nitrogeno y cobertura superficial.',
            ],
            [
                'tipo' => 'Soja',
                'variedad' => 'NS 5028 STS',
                'notas' => 'Variedad flexible para ambientes mixtos con buen comportamiento sanitario.',
            ],
            [
                'tipo' => 'Girasol',
                'variedad' => 'Paraiso 1800 CL',
                'notas' => 'Alternativa para rotacion en ambientes intermedios y lotes de ensayo.',
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

        Cultivo::query()->whereKey($cultivoIds['Soja|DM 46R18 STS'])->update([
            'cultivo_antecesor_id' => $cultivoIds['Trigo|Baguette 620'],
        ]);
        Cultivo::query()->whereKey($cultivoIds['Maiz|DK 72-72 VT3P'])->update([
            'cultivo_antecesor_id' => $cultivoIds['Trigo|ACA 360'],
        ]);
        Cultivo::query()->whereKey($cultivoIds['Papa|Spunta'])->update([
            'cultivo_antecesor_id' => $cultivoIds['Centeno|Quehuen INTA'],
        ]);
        Cultivo::query()->whereKey($cultivoIds['Vicia|Ascasubi'])->update([
            'cultivo_antecesor_id' => $cultivoIds['Centeno|Quehuen INTA'],
        ]);

        $campaniasCultivo = [
            'Fina 2025' => 'Trigo|Baguette 620',
            'Gruesa 2025/2026' => 'Soja|DM 46R18 STS',
            'Fina 2026' => 'Trigo|ACA 360',
            'Gruesa 2025/2026 Oeste' => 'Maiz|NK 842 VIP3',
            'Fina 2024' => 'Trigo|Klein Valor',
            'Papa 2025/2026' => 'Papa|Spunta',
            'Cobertura Invierno 2026' => 'Centeno|Quehuen INTA',
            'Ensayo Tardio 2025' => 'Girasol|Paraiso 1800 CL',
        ];

        foreach ($campaniasCultivo as $campaniaNombre => $cultivoKey) {
            Campania::query()
                ->where('nombre', $campaniaNombre)
                ->update(['cultivo_id' => $cultivoIds[$cultivoKey]]);
        }
    }
}
