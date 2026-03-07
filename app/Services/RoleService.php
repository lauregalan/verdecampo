<?php
namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function getAllRoles(){
        return Role::all();
    }

    public function modificarRoles(User $user, array $roles){
        $user->syncRoles($roles);
    }
}
