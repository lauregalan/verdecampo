<?php

namespace App\Services;

use App\Models\ProductoAplicacion;
use App\Models\TipoAplicacion;
use Illuminate\Support\Facades\DB;

class ReporteProductosService{

    public function generarReporteCatalogo(): array
    {
        $rankingProductos = ProductoAplicacion::withCount('aplicaciones')
            ->having('aplicaciones_count', '>', 0)
            ->orderByDesc('aplicaciones_count')
            ->take(10)
            ->get(['id', 'nombre', 'tipo', 'concentracion']);

        $rankingTipos = DB::table('productos_aplicaciones')
            ->join('aplicaciones', 'productos_aplicaciones.id', '=', 'aplicaciones.producto_aplicacion_id')
            ->select('productos_aplicaciones.tipo', DB::raw('COUNT(aplicaciones.id) as total_usos'))
            ->groupBy('productos_aplicaciones.tipo')
            ->orderByDesc('total_usos')
            ->get();

        $distribucionTiposAplicacion = TipoAplicacion::withCount('aplicaciones')
            ->having('aplicaciones_count', '>', 0)
            ->orderByDesc('aplicaciones_count')
            ->get(['id', 'nombre']);

        $insumosSinUso = ProductoAplicacion::doesntHave('aplicaciones')
            ->get(['id', 'nombre', 'tipo', 'concentracion']);

        return [
            'ranking_productos' => $rankingProductos,
            'ranking_tipos' => $rankingTipos,
            'insumos_sin_uso' => $insumosSinUso,
            'distribucion_tipos_aplicacion' => $distribucionTiposAplicacion,
        ];
    }
}
