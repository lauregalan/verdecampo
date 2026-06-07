<?php

namespace App\Services;

use App\Models\Cosecha;
use Illuminate\Support\Collection;

class ReporteRendimientoLotesService
{
    public function generar(?int $campaniaId = null): array
    {
        $cosechas = Cosecha::query()
            ->with(['campania', 'lote.campo'])
            ->when($campaniaId, fn ($query) => $query->where('campania_id', $campaniaId))
            ->orderBy('fecha')
            ->get();

        $lotes = $cosechas
            ->groupBy('lote_id')
            ->map(fn (Collection $grupo) => $this->resumirLote($grupo))
            ->sortByDesc('rinde_promedio')
            ->values();

        return [
            'generado_en' => now(),
            'campania_id' => $campaniaId,
            'resumen' => [
                'lotes_con_cosecha' => $lotes->count(),
                'cosechas_registradas' => $cosechas->count(),
                'rinde_promedio_general' => $cosechas->isEmpty() ? null : round((float) $cosechas->avg('rinde'), 2),
            ],
            'lotes' => $lotes,
            'mas_productivos' => $lotes->take(5)->values(),
            'mayor_variabilidad' => $lotes
                ->where('cantidad_cosechas', '>', 1)
                ->sortByDesc('desvio_rinde')
                ->take(5)
                ->values(),
        ];
    }

    private function resumirLote(Collection $cosechas): array
    {
        $primera = $cosechas->first();
        $rindes = $cosechas->pluck('rinde')->map(fn ($rinde) => (float) $rinde);
        $rindePromedio = round((float) $rindes->avg(), 2);

        return [
            'id' => $primera->lote_id,
            'nombre' => $primera->lote?->nombre ?? "Lote #{$primera->lote_id}",
            'campo' => $primera->lote?->campo?->nombre ?? 'Sin campo',
            'hectareas' => $primera->lote?->hectareas ? round((float) $primera->lote->hectareas, 2) : null,
            'cantidad_cosechas' => $cosechas->count(),
            'rinde_promedio' => $rindePromedio,
            'rinde_minimo' => round((float) $rindes->min(), 2),
            'rinde_maximo' => round((float) $rindes->max(), 2),
            'desvio_rinde' => $this->desvioEstandar($rindes),
            'coeficiente_variacion' => $rindePromedio > 0
                ? round(($this->desvioEstandar($rindes) / $rindePromedio) * 100, 2)
                : null,
            'evolucion' => $cosechas
                ->sortBy(fn (Cosecha $cosecha) => $cosecha->fecha?->format('Y-m-d') ?? '')
                ->map(fn (Cosecha $cosecha) => [
                    'fecha' => $cosecha->fecha,
                    'campania' => $cosecha->campania?->nombre ?? "Campania #{$cosecha->campania_id}",
                    'rinde' => round((float) $cosecha->rinde, 2),
                    'humedad' => round((float) $cosecha->humedad, 2),
                ])
                ->values(),
        ];
    }

    private function desvioEstandar(Collection $valores): float
    {
        $cantidad = $valores->count();

        if ($cantidad < 2) {
            return 0.0;
        }

        $promedio = (float) $valores->avg();
        $varianza = $valores
            ->map(fn (float $valor) => ($valor - $promedio) ** 2)
            ->sum() / $cantidad;

        return round(sqrt($varianza), 2);
    }
}
