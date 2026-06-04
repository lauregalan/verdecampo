<?php

namespace App\Exports;

use App\Models\Campania;
use Illuminate\Support\Collection;

class CampaniasExport
{
    public function headings(): array
    {
        return [
            'Nombre',
            'Campo',
            'Cultivo',
            'Fecha Inicio',
            'Fecha Fin',
            'Estado',
        ];
    }

    public function rows(): Collection
    {
        return Campania::with(['campo', 'cultivo'])
            ->orderBy('id')
            ->get()
            ->map(function (Campania $campania) {
                return [
                    $campania->nombre,
                    $campania->campo?->nombre ?? 'Sin campo',
                    $campania->cultivo?->tipo ?? 'Sin cultivo',
                    $campania->fecha_inicio?->format('d/m/Y') ?? 'N/A',
                    $campania->fecha_fin?->format('d/m/Y') ?? 'N/A',
                    ucfirst($campania->estado ?? 'N/A'),
                ];
            });
    }
}
