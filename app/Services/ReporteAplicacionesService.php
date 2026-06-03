<?php

namespace App\Services;

use App\Models\Aplicacion;
use Illuminate\Support\Collection;

class ReporteAplicacionesService
{
    public function generar(?int $campaniaId = null): array
    {
        $aplicaciones = Aplicacion::query()
            ->with(['campania', 'lote', 'productoAplicacion', 'tipoAplicacion'])
            ->when($campaniaId, fn ($query) => $query->where('campania_id', $campaniaId))
            ->orderByDesc('fecha')
            ->get();

        return [
            'generado_en' => now(),
            'campania_id' => $campaniaId,
            'resumen' => [
                'total_aplicaciones' => $aplicaciones->count(),
                'costo_total' => $this->sumarCostoPorMoneda($aplicaciones),
            ],
            'por_campania' => $this->agrupar($aplicaciones, fn (Aplicacion $aplicacion) => [
                'id' => $aplicacion->campania_id,
                'nombre' => $aplicacion->campania?->nombre ?? "Campania #{$aplicacion->campania_id}",
            ]),
            'por_lote' => $this->agrupar($aplicaciones, fn (Aplicacion $aplicacion) => [
                'id' => $aplicacion->lote_id,
                'nombre' => $aplicacion->lote?->nombre ?? "Lote #{$aplicacion->lote_id}",
            ]),
            'por_producto' => $this->agrupar($aplicaciones, fn (Aplicacion $aplicacion) => [
                'id' => $aplicacion->producto_aplicacion_id,
                'nombre' => $aplicacion->productoAplicacion?->nombre ?? "Producto #{$aplicacion->producto_aplicacion_id}",
            ]),
            'por_tipo' => $this->agrupar($aplicaciones, fn (Aplicacion $aplicacion) => [
                'id' => $aplicacion->tipo_aplicacion_id,
                'nombre' => $aplicacion->tipoAplicacion?->nombre ?? "Tipo #{$aplicacion->tipo_aplicacion_id}",
            ]),
        ];
    }

    private function agrupar(Collection $aplicaciones, callable $resolver): Collection
    {
        return $aplicaciones
            ->groupBy(fn (Aplicacion $aplicacion) => $resolver($aplicacion)['id'])
            ->map(function (Collection $grupo) use ($resolver) {
                $primeraAplicacion = $grupo->first();
                $identidad = $resolver($primeraAplicacion);

                return [
                    'id' => $identidad['id'],
                    'nombre' => $identidad['nombre'],
                    'cantidad_aplicaciones' => $grupo->count(),
                    'cantidad_insumo' => $this->sumarCantidadPorUnidad($grupo),
                    'costo_total' => $this->sumarCostoPorMoneda($grupo),
                ];
            })
            ->sortByDesc('cantidad_aplicaciones')
            ->values();
    }

    private function sumarCantidadPorUnidad(Collection $aplicaciones): Collection
    {
        return $aplicaciones
            ->groupBy(fn (Aplicacion $aplicacion) => $aplicacion->unidad ?: 'Sin unidad')
            ->map(fn (Collection $grupo, string $unidad) => [
                'unidad' => $unidad,
                'cantidad' => round((float) $grupo->sum('cantidad'), 2),
            ])
            ->values();
    }

    private function sumarCostoPorMoneda(Collection $aplicaciones): Collection
    {
        return $aplicaciones
            ->groupBy(fn (Aplicacion $aplicacion) => $aplicacion->moneda_precio_labor ?: 'Sin moneda')
            ->map(fn (Collection $grupo, string $moneda) => [
                'moneda' => $moneda,
                'total' => round((float) $grupo->sum('precio_labor'), 2),
            ])
            ->values();
    }
}
