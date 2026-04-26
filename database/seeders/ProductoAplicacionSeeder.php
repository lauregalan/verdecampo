<?php

namespace Database\Seeders;

use App\Models\ProductoAplicacion;
use Illuminate\Database\Seeder;

class ProductoAplicacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productos = [
            [
                'nombre' => 'Glifosato Full IV',
                'concentracion' => '48%',
                'tipo' => 'LIQUIDO',
            ],
            [
                'nombre' => '2,4-D Éster',
                'concentracion' => '97%',
                'tipo' => 'LIQUIDO',
            ],
            [
                'nombre' => 'Atrazina Plus',
                'concentracion' => '90%',
                'tipo' => 'GRANULADO',
            ],
            [
                'nombre' => 'S-Metolacloro',
                'concentracion' => '96%',
                'tipo' => 'LIQUIDO',
            ],
            [
                'nombre' => 'UAN 32',
                'concentracion' => '32 N',
                'tipo' => 'LIQUIDO',
            ],
            [
                'nombre' => 'Urea Protegida',
                'concentracion' => '46 N',
                'tipo' => 'GRANULADO',
            ],
            [
                'nombre' => 'Azoxistrobin + Cyproconazole',
                'concentracion' => '200 + 80 g/L',
                'tipo' => 'LIQUIDO',
            ],
            [
                'nombre' => 'Lambda Cihalotrina',
                'concentracion' => '5%',
                'tipo' => 'LIQUIDO',
            ],
            [
                'nombre' => 'Fosfato Monoamónico',
                'concentracion' => '11-52-0',
                'tipo' => 'GRANULADO',
            ],
            [
                'nombre' => 'Curasemilla Trigo Pack',
                'concentracion' => 'Premium',
                'tipo' => 'LIQUIDO',
            ],
        ];

        foreach ($productos as $producto) {
            ProductoAplicacion::query()->updateOrCreate(
                [
                    'nombre' => $producto['nombre'],
                    'concentracion' => $producto['concentracion'],
                ],
                $producto,
            );
        }
    }
}
