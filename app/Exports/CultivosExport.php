<?php

namespace App\Exports;

use App\Models\Cultivo;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CultivosExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection
     */
    public function collection()
    {
        return Cultivo::with('cultivoAntecesor')
            ->orderBy('id')
            ->get();
    }

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

    /**
     * @param  Cultivo  $cultivo
     */
    public function map($cultivo): array
    {
        return [
            $cultivo->tipo ?? 'N/A',
            $cultivo->variedad ?? 'N/A',
            $cultivo->cultivoAntecesor?->tipo ?? 'Sin antecesor',
            $cultivo->notas ?? '',
            $cultivo->created_at?->format('d/m/Y H:i:s'),
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
            'A' => 20,  // Tipo
            'B' => 25,  // Variedad
            'C' => 25,  // Cultivo Antecesor
            'D' => 40,  // Notas
            'E' => 20,  // Fecha de Creación
        ];
    }
}
