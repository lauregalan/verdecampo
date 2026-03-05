<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(['name' => 'Productor']); // Crea el rol de Productor, quien gestiona todo
        Role::create(['name' => 'Ingeniero']); //Crea el rol de Ingeniero agronomo, quien solo consulta la informacion
    }
}
