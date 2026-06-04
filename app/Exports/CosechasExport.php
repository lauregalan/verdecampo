<?php

namespace App\Exports;

use App\Models\Cosecha;
use Illuminate\Support\Collection;

class CosechasExport
{
    public function headings(): array
    {
        return [
            'Fecha',
            'Campaña',
            'Lote',
            'Rinde',
            'Humedad',
            'Observaciones',
        ];
    }

    public function rows(): Collection
    {
        return Cosecha::with(['campania', 'lote'])
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function (Cosecha $cosecha) {
                return [
                    $cosecha->fecha?->format('d/m/Y') ?? 'N/A',
                    $cosecha->campania?->nombre ?? 'Sin campaña',
                    $cosecha->lote?->nombre ?? 'Sin lote',
                    $cosecha->rinde ?? 'N/A',
                    $cosecha->humedad ?? 'N/A',
                    $cosecha->observaciones ?? '',
                ];
            });
    }
}
