<?php

namespace App\Services;
use App\Models\Lote;
use Illuminate\Support\Collection;

class ReporteSaludAgronomicaService
{
    public function generar(): array
    {
        $lotes = Lote::query()
            ->with ('campo')
            ->orderBy('id')
            ->get();

            return [
                'generado_en' => now(),
                'resumen' => $this->resumen($lotes),
                'por_estado' => $this->porEstado($lotes),
                'por_rango_ph' => $this->porRangoPh($lotes),
                'por_napa' => $this->porNapa($lotes),
                'listado' => $this->listado($lotes),
            ];
    }

    //Resumen general de la salud agronomica
    private function resumen(Collection $lotes): array
    {
        $conPh   = $lotes->whereNotNull('ph')->filter(fn ($l) => is_numeric($l->ph));
        $conNapa = $lotes->whereNotNull('napa')->filter(fn ($l) => is_numeric($l->napa));

        return [
            'total_lotes'       => $lotes->count(),
            'hectareas_totales' => round((float) $lotes->sum('hectareas'), 2),
            'ph_promedio'       => $conPh->isNotEmpty()
                ? round($conPh->avg('ph'), 2)
                : null,
            'napa_promedio'     => $conNapa->isNotEmpty()
                ? round($conNapa->avg('napa'), 2)
                : null,
        ];
    }
    // ─── Agrupaciones ───────────────────────────────────────────────────────

    private function porEstado(Collection $lotes): Collection
    {
        return $lotes
            ->groupBy(fn (Lote $lote) => $lote->estado ?: 'Sin estado')
            ->map(fn (Collection $grupo, string $estado) => [
                'estado'          => $estado,
                'cantidad_lotes'  => $grupo->count(),
                'hectareas_total' => round((float) $grupo->sum('hectareas'), 2),
            ])
            ->sortByDesc('cantidad_lotes')
            ->values();
    }

    private function porRangoPh(Collection $lotes): Collection
    {
        $rangos = [
            'Ácido (< 6.5)'      => fn ($ph) => $ph < 6.5,
            'Neutro (6.5 – 7.5)' => fn ($ph) => $ph >= 6.5 && $ph <= 7.5,
            'Alcalino (> 7.5)'   => fn ($ph) => $ph > 7.5,
            'Sin dato de pH'     => fn ($ph) => $ph === null,
        ];

        return collect($rangos)->map(function (callable $condicion, string $etiqueta) use ($lotes) {
            $grupo = $lotes->filter(function (Lote $lote) use ($condicion) {
                $ph = is_numeric($lote->ph) ? (float) $lote->ph : null;
                return $condicion($ph);
            });

            return [
                'rango'           => $etiqueta,
                'cantidad_lotes'  => $grupo->count(),
                'hectareas_total' => round((float) $grupo->sum('hectareas'), 2),
            ];
        })->values();
    }

    private function porNapa(Collection $lotes): Collection
    {
        return collect([
            [
                'categoria'       => 'Con dato de napa',
                'cantidad_lotes'  => $lotes->whereNotNull('napa')->count(),
                'hectareas_total' => round(
                    (float) $lotes->whereNotNull('napa')->sum('hectareas'),
                    2
                ),
            ],
            [
                'categoria'       => 'Sin dato de napa',
                'cantidad_lotes'  => $lotes->whereNull('napa')->count(),
                'hectareas_total' => round(
                    (float) $lotes->whereNull('napa')->sum('hectareas'),
                    2
                ),
            ],
        ]);
    }

    private function listado(Collection $lotes): Collection
    {
        return $lotes->map(fn (Lote $lote) => [
            'id'              => $lote->id,
            'nombre'          => $lote->nombre,
            'campo'           => $lote->campo?->nombre ?? "Campo #{$lote->campo_id}",
            'estado'          => $lote->estado ?: '—',
            'hectareas'       => $lote->hectareas,
            'ph'              => $lote->ph,
            'napa'            => $lote->napa,
            'caracteristicas' => $lote->caracteristicas,
        ])->values();
    }

}