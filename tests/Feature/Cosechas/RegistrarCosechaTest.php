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

it('does not register a harvest before campaign start date', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-01-10',
            'fecha_fin' => '2026-02-10',
        ])
        ->create();
    $lote = Lote::factory()->for($campo)->create();

    $response = $this->postJson('/api/cosechas', [
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
        'fecha' => '2026-01-09',
        'rinde' => 3200,
        'humedad' => 13.5,
        'observaciones' => null,
    ]);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['fecha'])
        ->assertJsonPath(
            'errors.fecha.0',
            'La fecha de cosecha no puede ser anterior al inicio de la campania.'
        );

    $this->assertDatabaseCount('cosechas', 0);
});
