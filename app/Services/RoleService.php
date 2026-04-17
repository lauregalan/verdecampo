<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function getAllRoles()
    {
        return Role::all();
    }

    public function getRolesByUserId(string $id): array
    {
        $user = User::with('roles:id,name')->findOrFail($id);

        return [
            'user_id' => $user->id,
            'roles' => $user->roles->pluck('name')->values(),
        ];
    }

    public function modificarRoles(User $user, array $roles)
    {
        $user->syncRoles($roles);
    }
}
