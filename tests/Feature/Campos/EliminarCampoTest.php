<?php

use App\Models\Campo;
use App\Models\Lote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('deletes a field with its lots', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $response = $this->deleteJson("/api/campos/{$campo->id}");

    $response->assertNoContent();

    $this->assertSoftDeleted('campos', ['id' => $campo->id]);
    $this->assertSoftDeleted('lotes', ['id' => $lote->id]);
});
