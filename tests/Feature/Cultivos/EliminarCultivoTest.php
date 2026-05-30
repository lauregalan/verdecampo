<?php

use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('soft deletes a crop without leaving its campaigns without crop', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->create();

    $response = $this->deleteJson("/api/cultivos/{$cultivo->id}");

    $response->assertNoContent();

    $this->assertSoftDeleted('cultivos', ['id' => $cultivo->id]);
    $this->assertDatabaseHas('campanias', [
        'id' => $campania->id,
        'cultivo_id' => $cultivo->id,
    ]);

    expect($campania->fresh()->cultivo)->not->toBeNull();
    expect($campania->fresh()->cultivo->id)->toBe($cultivo->id);
});

it('lists only active crops', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $cultivoActivo = Cultivo::factory()->create();
    $cultivoEliminado = Cultivo::factory()->create();
    $cultivoEliminado->delete();

    $response = $this->getJson('/api/cultivos');

    $response
        ->assertOk()
        ->assertJsonFragment(['id' => $cultivoActivo->id])
        ->assertJsonMissing(['id' => $cultivoEliminado->id]);
});
