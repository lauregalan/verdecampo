<?php

use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use App\Models\Lote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('does not create a campaign without lots', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();

    $payload = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->make()
        ->getAttributes();

    $payload['lote_ids'] = [];

    $response = $this->postJson('/api/campanias', $payload);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['lote_ids'])
        ->assertJsonPath(
            'errors.lote_ids.0',
            'No se pueden registrar campanias sin lotes asociados.'
        );

    $this->assertDatabaseCount('campanias', 0);
});

it('does not create a campaign in a field without its own lots', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campoSinLotes = Campo::factory()->create();
    $otroCampo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $loteDeOtroCampo = Lote::factory()->for($otroCampo)->create();

    $payload = Campania::factory()
        ->for($campoSinLotes)
        ->for($cultivo)
        ->make()
        ->getAttributes();

    $payload['lote_ids'] = [$loteDeOtroCampo->id];

    $response = $this->postJson('/api/campanias', $payload);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['lote_ids'])
        ->assertJsonPath(
            'errors.lote_ids.0',
            'No se pueden registrar campanias en un campo sin lotes asociados.'
        );

    $this->assertDatabaseCount('campanias', 0);
});

it('does not create a campaign with lots from another field', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $otroCampo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    Lote::factory()->for($campo)->create();
    $loteDeOtroCampo = Lote::factory()->for($otroCampo)->create();

    $payload = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->make()
        ->getAttributes();

    $payload['lote_ids'] = [$loteDeOtroCampo->id];

    $response = $this->postJson('/api/campanias', $payload);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['lote_ids'])
        ->assertJsonPath(
            'errors.lote_ids.0',
            'Todos los lotes seleccionados deben pertenecer al campo de la campania.'
        );

    $this->assertDatabaseCount('campanias', 0);
});
