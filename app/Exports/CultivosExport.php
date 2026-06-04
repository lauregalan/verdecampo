<?php

namespace App\Exports;

use App\Models\Cultivo;
use Illuminate\Support\Collection;

class CultivosExport
{
    public function headings(): array
    {
        return [
            'Tipo',
            'Variedad',
            'Cultivo Antecesor',
            'Notas',
            'Fecha de Creación',
        ];
    }

    public function rows(): Collection
    {
        return Cultivo::with('cultivoAntecesor')
            ->orderBy('id')
            ->get()
            ->map(function (Cultivo $cultivo) {
                return [
                    $cultivo->tipo ?? 'N/A',
                    $cultivo->variedad ?? 'N/A',
                    $cultivo->cultivoAntecesor?->tipo ?? 'Sin antecesor',
                    $cultivo->notas ?? '',
                    $cultivo->created_at?->format('d/m/Y H:i:s'),
                ];
            });
    }
}
