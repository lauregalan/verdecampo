<?php

namespace App\Exports;

use App\Models\Lote;
use Illuminate\Support\Collection;

class LotesExport
{
    public function headings(): array
    {
        return [
            'Nombre',
            'Campo',
            'Hectáreas',
            'Estado',
            'pH',
            'Napa',
            'Latitud',
            'Longitud',
            'Características',
        ];
    }

    public function rows(): Collection
    {
        return Lote::with('campo')
            ->orderBy('id')
            ->get()
            ->map(function (Lote $lote) {
                return [
                    $lote->nombre,
                    $lote->campo?->nombre ?? 'Sin campo',
                    number_format($lote->hectareas, 2, ',', '.'),
                    ucfirst($lote->estado ?? 'N/A'),
                    $lote->ph ?? 'N/A',
                    $lote->napa ?? 'N/A',
                    $lote->latitud ?? 'N/A',
                    $lote->longitud ?? 'N/A',
                    $lote->caracteristicas ?? '',
                ];
            });
    }
}
