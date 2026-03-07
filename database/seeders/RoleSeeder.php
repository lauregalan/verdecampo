<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Spatie\Permission\Models\Role;
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'Productor']); // Crea el rol de Productor, quien gestiona todo
        Role::firstOrCreate(['name' => 'Ingeniero']); // Crea el rol de Ingeniero agronomo, quien solo consulta la informacion
        Role::firstOrCreate(['name' => 'Empleado']); // Rol por defecto para nuevos usuarios
    }
}
