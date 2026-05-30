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

it('lists sowings ordered by sowing date', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state(['estado' => 'En Curso'])
        ->create();

    Siembra::create([
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'cultivo_id' => $cultivo->id,
        'fecha_siembra' => '2026-01-10',
        'observaciones' => 'Primera siembra',
    ]);

    Siembra::create([
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'cultivo_id' => $cultivo->id,
        'fecha_siembra' => '2026-01-20',
        'observaciones' => 'Segunda siembra',
    ]);

    $response = $this->getJson('/api/siembras');

    $response
        ->assertOk()
        ->assertJsonPath('0.fecha_siembra', '2026-01-20')
        ->assertJsonPath('1.fecha_siembra', '2026-01-10');
});

it('lists sowings with soft deleted lot and crop history', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state(['estado' => 'En Curso'])
        ->create();

    $siembra = Siembra::create([
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'cultivo_id' => $cultivo->id,
        'fecha_siembra' => '2026-01-10',
        'observaciones' => null,
    ]);

    $lote->delete();
    $cultivo->delete();

    $response = $this->getJson('/api/siembras');

    $response
        ->assertOk()
        ->assertJsonPath('0.id', $siembra->id)
        ->assertJsonPath('0.lote_nombre', $lote->nombre)
        ->assertJsonPath('0.cultivo_nombre', $cultivo->tipo.' '.$cultivo->variedad);
});

it('shows the previous crop from the same lot as predecessor crop', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivoAntecesor = Cultivo::factory()->state([
        'tipo' => 'Trigo',
        'variedad' => 'Baguette 620',
    ])->create();
    $cultivoActual = Cultivo::factory()->state([
        'tipo' => 'Soja',
        'variedad' => 'DM 46R18',
    ])->create();
    $lote = Lote::factory()->for($campo)->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivoActual)
        ->state(['estado' => 'En Curso'])
        ->create();

    Siembra::create([
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'cultivo_id' => $cultivoAntecesor->id,
        'fecha_siembra' => '2026-01-10',
        'observaciones' => null,
    ]);

    Siembra::create([
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'cultivo_id' => $cultivoActual->id,
        'fecha_siembra' => '2026-03-10',
        'observaciones' => null,
    ]);

    $response = $this->getJson('/api/siembras');

    $response
        ->assertOk()
        ->assertJsonPath('0.cultivo_nombre', 'Soja DM 46R18')
        ->assertJsonPath('0.cultivo_antecesor_nombre', 'Trigo Baguette 620')
        ->assertJsonPath('1.cultivo_antecesor_nombre', null);
});

it('does not use a sowing from another lot as predecessor crop', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivoAntecesor = Cultivo::factory()->state(['tipo' => 'Trigo'])->create();
    $cultivoActual = Cultivo::factory()->state(['tipo' => 'Soja'])->create();
    $loteConAntecesor = Lote::factory()->for($campo)->create();
    $loteSinAntecesor = Lote::factory()->for($campo)->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivoActual)
        ->state(['estado' => 'En Curso'])
        ->create();

    Siembra::create([
        'campania_id' => $campania->id,
        'lote_id' => $loteConAntecesor->id,
        'cultivo_id' => $cultivoAntecesor->id,
        'fecha_siembra' => '2026-01-10',
        'observaciones' => null,
    ]);

    Siembra::create([
        'campania_id' => $campania->id,
        'lote_id' => $loteSinAntecesor->id,
        'cultivo_id' => $cultivoActual->id,
        'fecha_siembra' => '2026-03-10',
        'observaciones' => null,
    ]);

    $response = $this->getJson('/api/siembras');

    $response
        ->assertOk()
        ->assertJsonPath('0.cultivo_antecesor_nombre', null);
});
