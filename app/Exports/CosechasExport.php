<?php

namespace App\Exports;

use App\Models\Cosecha;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CosechasExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection
     */
    public function collection()
    {
        return Cosecha::with(['campania', 'lote'])
            ->orderBy('fecha', 'desc')
            ->get();
    }

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

    /**
     * @param  Cosecha  $cosecha
     */
    public function map($cosecha): array
    {
        return [
            $cosecha->fecha?->format('d/m/Y') ?? 'N/A',
            $cosecha->campania?->nombre ?? 'Sin campaña',
            $cosecha->lote?->nombre ?? 'Sin lote',
            $cosecha->rinde ?? 'N/A',
            $cosecha->humedad ?? 'N/A',
            $cosecha->observaciones ?? '',
        ];
    }

    /**
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '059669'],
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 12,  // Fecha
            'B' => 30,  // Campaña
            'C' => 25,  // Lote
            'D' => 12,  // Rinde
            'E' => 12,  // Humedad
            'F' => 40,  // Observaciones
        ];
    }
}
