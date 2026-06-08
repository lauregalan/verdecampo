<?php

use App\Models\Campo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('Productor', 'web');
    $this->user = User::factory()->create();
    $this->user->assignRole('Productor');
    Sanctum::actingAs($this->user);
});

it('creates a field with valid surface area', function () {
    $response = $this->postJson('/api/campos', [
        'nombre' => 'Campo Test',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 100,
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('campos', [
        'nombre' => 'Campo Test',
        'hectareas' => 100,
    ]);
});

it('rejects field creation with negative surface area', function () {
    $response = $this->postJson('/api/campos', [
        'nombre' => 'Campo Test',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => -50,
    ]);

    $response->assertStatus(422);
});

it('rejects field creation with zero surface area', function () {
    $response = $this->postJson('/api/campos', [
        'nombre' => 'Campo Test',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 0,
    ]);

    // Zero could be valid depending on business logic, adjust based on requirements
    // For now, we test that it's either accepted or rejected consistently
    $response->assertStatus(422);
});

it('accepts field creation with minimum valid surface', function () {
    $response = $this->postJson('/api/campos', [
        'nombre' => 'Campo Test',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 1,
    ]);

    $response->assertCreated();
});

it('accepts field creation with very large surface area', function () {
    $response = $this->postJson('/api/campos', [
        'nombre' => 'Campo Test',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 500000,
    ]);

    $response->assertCreated();
});

it('updates field surface area with valid value', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $response = $this->putJson("/api/campos/{$campo->id}", [
        'nombre' => $campo->nombre,
        'latitud' => $campo->latitud,
        'longitud' => $campo->longitud,
        'hectareas' => 200,
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('campos', [
        'id' => $campo->id,
        'hectareas' => 200,
    ]);
});

it('rejects field update with negative surface area', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $response = $this->putJson("/api/campos/{$campo->id}", [
        'nombre' => $campo->nombre,
        'latitud' => $campo->latitud,
        'longitud' => $campo->longitud,
        'hectareas' => -50,
    ]);

    $response->assertStatus(422);
    $this->assertDatabaseHas('campos', [
        'id' => $campo->id,
        'hectareas' => 100, // Should remain unchanged
    ]);
});
