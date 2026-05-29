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

it('soft deletes a lot associated with a campaign without losing campaign data', function () {
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
        ->create();

    $campania->lotes()->attach($lote);

    $response = $this->deleteJson("/api/lotes/{$lote->id}");

    $response->assertOk();

    $this->assertSoftDeleted('lotes', ['id' => $lote->id]);
    $this->assertDatabaseHas('campania_lote', [
        'campania_id' => $campania->id,
        'lote_id' => $lote->id,
    ]);
    expect($campania->fresh()->lotes)->toHaveCount(1);
});
