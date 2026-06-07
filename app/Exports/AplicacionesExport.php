<?php

namespace App\Exports;

use App\Models\Aplicacion;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AplicacionesExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection
     */
    public function collection()
    {
        return Aplicacion::with(['productoAplicacion', 'tipoAplicacion', 'campania', 'lote'])
            ->orderBy('fecha', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Producto',
            'Tipo',
            'Campaña',
            'Lote',
            'Cantidad',
            'Unidad',
            'Precio Labor',
            'Moneda',
            'Observaciones',
        ];
    }

    /**
     * @param  Aplicacion  $aplicacion
     */
    public function map($aplicacion): array
    {
        return [
            $aplicacion->fecha?->format('d/m/Y') ?? 'N/A',
            $aplicacion->productoAplicacion?->nombre ?? 'Sin producto',
            $aplicacion->tipoAplicacion?->nombre ?? 'Sin tipo',
            $aplicacion->campania?->nombre ?? 'Sin campaña',
            $aplicacion->lote?->nombre ?? 'Sin lote',
            number_format($aplicacion->cantidad, 2, ',', '.'),
            $aplicacion->unidad ?? 'N/A',
            number_format($aplicacion->precio_labor, 2, ',', '.'),
            $aplicacion->moneda_precio_labor ?? 'N/A',
            $aplicacion->observaciones ?? '',
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
            'B' => 25,  // Producto
            'C' => 20,  // Tipo
            'D' => 25,  // Campaña
            'E' => 20,  // Lote
            'F' => 12,  // Cantidad
            'G' => 10,  // Unidad
            'H' => 15,  // Precio Labor
            'I' => 10,  // Moneda
            'J' => 40,  // Observaciones
        ];
    }
}
