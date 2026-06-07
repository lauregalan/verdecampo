<?php

namespace App\Services;

use App\Models\Cultivo;
use App\Models\Lote;
use Illuminate\Support\Facades\DB;

class ReporteRotacionCultivosService
{
    public function generar(): array
    {
        $frecuenciaCultivos = Cultivo::withCount('campanias')
            ->whereHas('campanias')
            ->orderByDesc('campanias_count')
            ->get(['id', 'tipo', 'variedad', 'campanias_count']);

        $antecesoresComunes = Cultivo::select(['cultivo_antecesor_id', DB::raw('COUNT(*) as total')])
            ->whereNotNull('cultivo_antecesor_id')
            ->groupBy('cultivo_antecesor_id')
            ->orderByDesc('total')
            ->with('cultivoAntecesor:id,tipo,variedad')
            ->take(5)
            ->get();

        $lotes = Lote::with(['campanias' => function ($query) {
            $query->orderBy('fecha_inicio', 'asc')->with('cultivo');
        }])->get();

        $rotacionPorLote = [];
        $alertasRepeticion = [];

        foreach ($lotes as $lote) {
            $historial = [];
            $campanias = $lote->campanias;

            $cultivoAnteriorId = null;
            $campaniaAnteriorNombre = null;

            foreach ($campanias as $campania) {
                if (! $campania->cultivo) {
                    continue;
                }

                $cultivoActual = $campania->cultivo;
                $nombreCultivo = "{$cultivoActual->tipo} ({$cultivoActual->variedad})";

                $historial[] = [
                    'campania_id' => $campania->id,
                    'campania_nombre' => $campania->nombre,
                    'cultivo' => $nombreCultivo,
                    'fecha_inicio' => $campania->fecha_inicio,
                ];

                if ($cultivoAnteriorId === $cultivoActual->id) {
                    $alertasRepeticion[] = [
                        'lote_nombre' => $lote->nombre,
                        'cultivo' => $nombreCultivo,
                        'campania_actual' => $campania->nombre,
                        'campania_anterior' => $campaniaAnteriorNombre,
                    ];
                }

                $cultivoAnteriorId = $cultivoActual->id;
                $campaniaAnteriorNombre = $campania->nombre;
            }

            if (! empty($historial)) {
                $rotacionPorLote[] = [
                    'lote_id' => $lote->id,
                    'lote_nombre' => $lote->nombre,
                    'historial' => $historial,
                ];
            }
        }

        return [
            'frecuencia_cultivos' => $frecuenciaCultivos,
            'antecesores_comunes' => $antecesoresComunes,
            'rotacion_por_lote' => $rotacionPorLote,
            'alertas_repeticion' => $alertasRepeticion,
        ];
    }
}
