<?php

namespace App\Exports;

use App\Models\Campania;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CampaniasExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection
     */
    public function collection()
    {
        return Campania::with(['campo', 'cultivo'])
            ->orderBy('id')
            ->get();
    }

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

    /**
     * @param  Campania  $campania
     */
    public function map($campania): array
    {
        return [
            $campania->nombre,
            $campania->campo?->nombre ?? 'Sin campo',
            $campania->cultivo?->tipo ?? 'Sin cultivo',
            $campania->fecha_inicio?->format('d/m/Y') ?? 'N/A',
            $campania->fecha_fin?->format('d/m/Y') ?? 'N/A',
            ucfirst($campania->estado ?? 'N/A'),
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
            'A' => 30,  // Nombre
            'B' => 25,  // Campo
            'C' => 20,  // Cultivo
            'D' => 15,  // Fecha Inicio
            'E' => 15,  // Fecha Fin
            'F' => 15,  // Estado
        ];
    }
}
