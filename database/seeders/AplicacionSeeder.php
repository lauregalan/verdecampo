<?php

namespace Database\Seeders;

use App\Models\Aplicacion;
use App\Models\Campania;
use App\Models\ProductoAplicacion;
use App\Models\TipoAplicacion;
use Illuminate\Database\Seeder;

class AplicacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aplicaciones = [
            [
                'campania' => 'Fina 2025',
                'lote' => 'Lote Norte',
                'producto' => 'Curasemilla Trigo Pack',
                'concentracion' => 'Premium',
                'tipo_aplicacion' => 'Curasemilla',
                'cantidad' => 2.4,
                'unidad' => 'l/t',
                'fecha' => '2025-05-10',
                'precio_labor' => 18.50,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Tratamiento previo a la siembra con foco en uniformidad de emergencia.',
            ],

        ];

        foreach ($aplicaciones as $data) {
            $campania = Campania::query()
                ->where('nombre', $data['campania'])
                ->firstOrFail();

            $lote = $campania->lotes()
                ->where('nombre', $data['lote'])
                ->firstOrFail();

            $producto = ProductoAplicacion::query()
                ->where('nombre', $data['producto'])
                ->where('concentracion', $data['concentracion'])
                ->firstOrFail();

            $tipoAplicacion = TipoAplicacion::query()
                ->where('nombre', $data['tipo_aplicacion'])
                ->firstOrFail();

            Aplicacion::query()->updateOrCreate(
                [
                    'campania_id' => $campania->id,
                    'lote_id' => $lote->id,
                    'producto_aplicacion_id' => $producto->id,
                    'tipo_aplicacion_id' => $tipoAplicacion->id,
                    'fecha' => $data['fecha'],
                ],
                [
                    'cantidad' => $data['cantidad'],
                    'unidad' => $data['unidad'],
                    'precio_labor' => $data['precio_labor'],
                    'moneda_precio_labor' => $data['moneda_precio_labor'],
                    'observaciones' => $data['observaciones'],
                ],
            );
        }
    }
}
