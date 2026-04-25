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
            [
                'campania' => 'Fina 2025',
                'lote' => 'Lote Molino',
                'producto' => 'Urea Protegida',
                'concentracion' => '46 N',
                'tipo_aplicacion' => 'Fertilización',
                'cantidad' => 120,
                'unidad' => 'kg/ha',
                'fecha' => '2025-06-18',
                'precio_labor' => 14.00,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Aplicación al macollaje con pronóstico de lluvias leves en 48 horas.',
            ],
            [
                'campania' => 'Gruesa 2025/2026',
                'lote' => 'Lote Norte',
                'producto' => 'Glifosato Full IV',
                'concentracion' => '48%',
                'tipo_aplicacion' => 'Barbecho químico',
                'cantidad' => 2.8,
                'unidad' => 'l/ha',
                'fecha' => '2025-09-12',
                'precio_labor' => 12.75,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Control temprano de gramíneas y latifoliadas previo a la siembra de gruesa.',
            ],
            [
                'campania' => 'Gruesa 2025/2026',
                'lote' => 'Lote Bajo',
                'producto' => 'S-Metolacloro',
                'concentracion' => '96%',
                'tipo_aplicacion' => 'Preemergencia',
                'cantidad' => 1.4,
                'unidad' => 'l/ha',
                'fecha' => '2025-10-06',
                'precio_labor' => 13.10,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Aplicado sobre buena humedad superficial para asegurar residualidad.',
            ],
            [
                'campania' => 'Gruesa 2025/2026 Oeste',
                'lote' => 'Lote Ruta 8',
                'producto' => 'Atrazina Plus',
                'concentracion' => '90%',
                'tipo_aplicacion' => 'Preemergencia',
                'cantidad' => 1.8,
                'unidad' => 'kg/ha',
                'fecha' => '2025-10-02',
                'precio_labor' => 11.20,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Mezcla residual para maíz temprano en lote con buen contenido de rastrojo.',
            ],
            [
                'campania' => 'Gruesa 2025/2026 Oeste',
                'lote' => 'Lote Canada Honda',
                'producto' => 'UAN 32',
                'concentracion' => '32 N',
                'tipo_aplicacion' => 'Fertilización',
                'cantidad' => 140,
                'unidad' => 'l/ha',
                'fecha' => '2025-11-14',
                'precio_labor' => 15.60,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Refuerzo nitrogenado en V6 con buena condición hídrica del perfil.',
            ],
            [
                'campania' => 'Papa 2025/2026',
                'lote' => 'Lote Sierra Chica',
                'producto' => 'Azoxistrobin + Cyproconazole',
                'concentracion' => '200 + 80 g/L',
                'tipo_aplicacion' => 'Fungicida',
                'cantidad' => 0.45,
                'unidad' => 'l/ha',
                'fecha' => '2025-11-28',
                'precio_labor' => 19.30,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Aplicación preventiva por presión de tizón y cierre de entresurco.',
            ],
            [
                'campania' => 'Papa 2025/2026',
                'lote' => 'Lote Sierra Chica',
                'producto' => 'Lambda Cihalotrina',
                'concentracion' => '5%',
                'tipo_aplicacion' => 'Insecticida',
                'cantidad' => 0.12,
                'unidad' => 'l/ha',
                'fecha' => '2025-12-16',
                'precio_labor' => 10.40,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Intervención puntual por monitoreo con presencia de trips sobre borde.',
            ],
            [
                'campania' => 'Cobertura Invierno 2026',
                'lote' => 'Lote El Ombu',
                'producto' => 'Fosfato Monoamónico',
                'concentracion' => '11-52-0',
                'tipo_aplicacion' => 'Fertilización',
                'cantidad' => 65,
                'unidad' => 'kg/ha',
                'fecha' => '2026-06-11',
                'precio_labor' => 9.80,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Arranque de cobertura con aporte fosforado para mejorar implantación.',
            ],
            [
                'campania' => 'Cobertura Invierno 2026',
                'lote' => 'Lote Laguna',
                'producto' => '2,4-D Éster',
                'concentracion' => '97%',
                'tipo_aplicacion' => 'Postemergencia',
                'cantidad' => 0.6,
                'unidad' => 'l/ha',
                'fecha' => '2026-07-03',
                'precio_labor' => 8.90,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Repaso sobre malezas de hoja ancha en cobertura ya implantada.',
            ],
            [
                'campania' => 'Fina 2026',
                'lote' => 'Lote Molino',
                'producto' => 'Curasemilla Trigo Pack',
                'concentracion' => 'Premium',
                'tipo_aplicacion' => 'Curasemilla',
                'cantidad' => 2.2,
                'unidad' => 'l/t',
                'fecha' => '2026-05-12',
                'precio_labor' => 18.90,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Tratamiento previo a la siembra sobre semilla fiscalizada.',
            ],
            [
                'campania' => 'Fina 2026',
                'lote' => 'Lote Bajo',
                'producto' => 'Azoxistrobin + Cyproconazole',
                'concentracion' => '200 + 80 g/L',
                'tipo_aplicacion' => 'Aplicación foliar',
                'cantidad' => 0.35,
                'unidad' => 'l/ha',
                'fecha' => '2026-09-02',
                'precio_labor' => 17.25,
                'moneda_precio_labor' => 'USD',
                'observaciones' => 'Aplicación foliar en hoja bandera por pronóstico favorable a roya.',
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
