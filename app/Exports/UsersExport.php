<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Collection;

class UsersExport
{
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

    public function rows(): Collection
    {
        return User::with('roles:id,name')
            ->orderBy('id')
            ->get()
            ->map(function (User $user) {
                return [
                    $user->name,
                    $user->email,
                    $user->roles->pluck('name')->join(', '),
                    $user->active ? 'Activo' : 'Inactivo',
                    $user->last_login_at?->format('d/m/Y H:i:s') ?? 'Nunca',
                    $user->email_verified_at ? 'Sí' : 'No',
                    $user->updated_at?->format('d/m/Y H:i:s'),
                ];
            });
    }
}
