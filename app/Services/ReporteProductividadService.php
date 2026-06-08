<?php

namespace App\Services;

use App\Models\Campania;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReporteProductividadService
{
    public function generar(?int $campaniaId = null): array
    {
        $campanias = Campania::query()
            ->with(['campo', 'cultivo', 'cosechas.lote'])
            ->when($campaniaId, fn ($query) => $query->whereKey($campaniaId))
            ->orderByDesc('fecha_inicio')
            ->get();

        $filas = $campanias
            ->map(fn (Campania $campania) => $this->resumirCampania($campania))
            ->values();

        $filasConCosechas = $filas->where('cantidad_cosechas', '>', 0)->values();

        return [
            'generado_en' => now(),
            'campania_id' => $campaniaId,
            'filas' => $filas,
            'resumen' => $this->resumenGeneral($filasConCosechas),
            'mejor_campania' => $this->campaniaExtrema($filasConCosechas, 'desc'),
            'peor_campania' => $this->campaniaExtrema($filasConCosechas, 'asc'),
        ];
    }

    private function resumirCampania(Campania $campania): array
    {
        $cosechas = $campania->cosechas;
        $fechaFin = $this->fechaFinCampania($campania);
        $duracionDias = $campania->fecha_inicio
            ? Carbon::parse($campania->fecha_inicio)->diffInDays($fechaFin) + 1
            : null;

        return [
            'id' => $campania->id,
            'nombre' => $campania->nombre,
            'campo' => $campania->campo?->nombre ?? 'Sin campo',
            'cultivo' => $campania->cultivo?->tipo ?? $campania->cultivo ?? 'Sin cultivo',
            'estado' => $campania->estado,
            'fecha_inicio' => $campania->fecha_inicio ? Carbon::parse($campania->fecha_inicio) : null,
            'fecha_fin' => $fechaFin,
            'duracion_dias' => $duracionDias,
            'cantidad_cosechas' => $cosechas->count(),
            'lotes_cosechados' => $cosechas->pluck('lote_id')->unique()->count(),
            'rinde_promedio' => $this->promedio($cosechas, 'rinde'),
            'humedad_promedio' => $this->promedio($cosechas, 'humedad'),
            'rinde_total' => round((float) $cosechas->sum('rinde'), 2),
        ];
    }

    private function fechaFinCampania(Campania $campania): ?Carbon
    {
        if ($campania->fecha_fin) {
            return Carbon::parse($campania->fecha_fin);
        }

        $ultimaCosecha = $campania->cosechas
            ->pluck('fecha')
            ->filter()
            ->sort()
            ->last();

        return $ultimaCosecha ? Carbon::parse($ultimaCosecha) : now();
    }

    private function promedio(Collection $items, string $campo): ?float
    {
        if ($items->isEmpty()) {
            return null;
        }

        return round((float) $items->avg($campo), 2);
    }

    private function resumenGeneral(Collection $filas): array
    {
        return [
            'campanias_con_cosecha' => $filas->count(),
            'cosechas_registradas' => $filas->sum('cantidad_cosechas'),
            'rinde_promedio_general' => $filas->isEmpty() ? null : round((float) $filas->avg('rinde_promedio'), 2),
            'humedad_promedio_general' => $filas->isEmpty() ? null : round((float) $filas->avg('humedad_promedio'), 2),
        ];
    }

    private function campaniaExtrema(Collection $filas, string $direccion): ?array
    {
        if ($filas->isEmpty()) {
            return null;
        }

        return $direccion === 'desc'
            ? $filas->sortByDesc('rinde_promedio')->first()
            : $filas->sortBy('rinde_promedio')->first();
    }
}
