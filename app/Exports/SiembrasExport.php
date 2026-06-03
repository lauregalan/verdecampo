<?php

namespace App\Exports;

use App\Models\Siembra;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SiembrasExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection
     */
    public function collection()
    {
        return Siembra::with(['campania', 'lote', 'cultivo'])
            ->orderBy('fecha_siembra', 'desc')
            ->get();
    }

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

    /**
     * @param  Siembra  $siembra
     */
    public function map($siembra): array
    {
        return [
            $siembra->fecha_siembra?->format('d/m/Y') ?? 'N/A',
            $siembra->campania?->nombre ?? 'Sin campaña',
            $siembra->lote?->nombre ?? 'Sin lote',
            $siembra->cultivo?->tipo ?? 'Sin cultivo',
            $siembra->observaciones ?? '',
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
            'A' => 15,  // Fecha Siembra
            'B' => 30,  // Campaña
            'C' => 25,  // Lote
            'D' => 25,  // Cultivo
            'E' => 40,  // Observaciones
        ];
    }
}
