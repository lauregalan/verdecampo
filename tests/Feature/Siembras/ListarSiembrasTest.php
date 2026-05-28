<?php

use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use App\Models\Lote;
use App\Models\Siembra;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('lists siembras with resolved names and antecedent crop', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::query()->create([
        'nombre' => 'Campo Oeste',
        'latitud' => '-34.6037',
        'longitud' => '-58.3816',
        'hectareas' => 120,
    ]);

    $cultivoAnterior = Cultivo::query()->create([
        'tipo' => 'Trigo',
        'variedad' => 'Baguette 620',
        'cultivo_antecesor_id' => null,
        'notas' => 'Cultivo anterior',
    ]);

    $cultivoActual = Cultivo::query()->create([
        'tipo' => 'Soja',
        'variedad' => 'DM 46R18',
        'cultivo_antecesor_id' => $cultivoAnterior->id,
        'notas' => 'Cultivo actual',
    ]);

    $campania = Campania::query()->create([
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivoActual->id,
        'nombre' => 'Campania 2026',
        'fecha_inicio' => '2026-01-10',
        'fecha_fin' => '2026-05-30',
        'estado' => 'En Curso',
    ]);

    $lote = Lote::query()->create([
        'nombre' => 'Lote Norte',
        'caracteristicas' => 'Sector de prueba',
        'estado' => 'Disponible',
        'longitud' => -58.3816,
        'latitud' => -34.6037,
        'hectareas' => 40,
        'ph' => 6.5,
        'napa' => 2.1,
        'campo_id' => $campo->id,
        'polygon' => null,
    ]);

    $campania->lotes()->attach($lote->id);

    Siembra::query()->create([
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'cultivo_id' => $cultivoAnterior->id,
        'fecha_siembra' => '2026-01-15',
        'observaciones' => 'Primera siembra',
    ]);

    $siembraActual = Siembra::query()->create([
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'cultivo_id' => $cultivoActual->id,
        'fecha_siembra' => '2026-02-20',
        'observaciones' => 'Segunda siembra',
    ]);

    $response = $this->getJson('/api/siembras');

    $response
        ->assertOk()
        ->assertJsonCount(2)
        ->assertJsonPath('0.id', $siembraActual->id)
        ->assertJsonPath('0.campania_nombre', 'Campania 2026')
        ->assertJsonPath('0.lote_nombre', 'Lote Norte')
        ->assertJsonPath('0.cultivo_nombre', 'Soja DM 46R18')
        ->assertJsonPath('0.cultivo_antecesor_nombre', 'Trigo Baguette 620');
});
