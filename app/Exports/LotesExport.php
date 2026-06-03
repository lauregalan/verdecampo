<?php

namespace App\Exports;

use App\Models\Lote;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LotesExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection
     */
    public function collection()
    {
        return Lote::with('campo')
            ->orderBy('id')
            ->get();
    }

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

    /**
     * @param  Lote  $lote
     */
    public function map($lote): array
    {
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
            'A' => 25,  // Nombre
            'B' => 25,  // Campo
            'C' => 12,  // Hectáreas
            'D' => 15,  // Estado
            'E' => 10,  // pH
            'F' => 10,  // Napa
            'G' => 15,  // Latitud
            'H' => 15,  // Longitud
            'I' => 40,  // Características
        ];
    }
}
