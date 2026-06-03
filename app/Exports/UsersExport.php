<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UsersExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection
     */
    public function collection()
    {
        return User::with('roles:id,name')
            ->orderBy('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Nombre',
            'Email',
            'Roles',
            'Estado',
            'Último Acceso',
            'Email Verificado',
            'Fecha de Actualización',
        ];
    }

    /**
     * @param  User  $user
     */
    public function map($user): array
    {
        return [
            $user->name,
            $user->email,
            $user->roles->pluck('name')->join(', '),
            $user->active ? 'Activo' : 'Inactivo',
            $user->last_login_at?->format('d/m/Y H:i:s') ?? 'Nunca',
            $user->email_verified_at ? 'Sí' : 'No',
            $user->updated_at?->format('d/m/Y H:i:s'),
        ];
    }

    /**
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Estilo para la fila de encabezado
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '059669'], // Verde
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 30,  // Nombre
            'B' => 35,  // Email
            'C' => 20,  // Roles
            'D' => 12,  // Estado
            'E' => 20,  // Último Acceso
            'F' => 18,  // Email Verificado
            'G' => 20,  // Fecha de Actualización
        ];
    }
}
