<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CampoSeeder::class,
            CampaniaSeeder::class,
            LoteSeeder::class,
            CampaniaLoteSeeder::class,
            CultivoSeeder::class,
            TipoAplicacionSeeder::class,
            ProductoAplicacionSeeder::class,
            AplicacionSeeder::class,
        ]);
    }
}
