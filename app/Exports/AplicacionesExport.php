<?php

namespace App\Exports;

use App\Models\Aplicacion;
use Illuminate\Support\Collection;

class AplicacionesExport
{
    public function headings(): array
    {
        return [
            'Fecha',
            'Producto',
            'Tipo',
            'Campaña',
            'Lote',
            'Cantidad',
            'Unidad',
            'Precio Labor',
            'Moneda',
            'Observaciones',
        ];
    }

    public function rows(): Collection
    {
        return Aplicacion::with(['productoAplicacion', 'tipoAplicacion', 'campania', 'lote'])
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function (Aplicacion $aplicacion) {
                return [
                    $aplicacion->fecha?->format('d/m/Y') ?? 'N/A',
                    $aplicacion->productoAplicacion?->nombre ?? 'Sin producto',
                    $aplicacion->tipoAplicacion?->nombre ?? 'Sin tipo',
                    $aplicacion->campania?->nombre ?? 'Sin campaña',
                    $aplicacion->lote?->nombre ?? 'Sin lote',
                    number_format($aplicacion->cantidad, 2, ',', '.'),
                    $aplicacion->unidad ?? 'N/A',
                    number_format($aplicacion->precio_labor, 2, ',', '.'),
                    $aplicacion->moneda_precio_labor ?? 'N/A',
                    $aplicacion->observaciones ?? '',
                ];
            });
    }
}
