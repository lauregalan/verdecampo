<?php

namespace App\Exports;

use App\Models\Siembra;
use Illuminate\Support\Collection;

class SiembrasExport
{
    public function headings(): array
    {
        return [
            'Fecha Siembra',
            'Campaña',
            'Lote',
            'Cultivo',
            'Observaciones',
        ];
    }

    public function rows(): Collection
    {
        return Siembra::with(['campania', 'lote', 'cultivo'])
            ->orderBy('fecha_siembra', 'desc')
            ->get()
            ->map(function (Siembra $siembra) {
                return [
                    $siembra->fecha_siembra?->format('d/m/Y') ?? 'N/A',
                    $siembra->campania?->nombre ?? 'Sin campaña',
                    $siembra->lote?->nombre ?? 'Sin lote',
                    $siembra->cultivo?->tipo ?? 'Sin cultivo',
                    $siembra->observaciones ?? '',
                ];
            });
    }
}
