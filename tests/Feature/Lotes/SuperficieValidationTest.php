<?php

use App\Models\Campo;
use App\Models\Lote;
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

it('creates a lot with valid surface area', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 50,
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('lotes', [
        'nombre' => 'Lote Test',
        'hectareas' => 50,
        'campo_id' => $campo->id,
    ]);
});

it('rejects lot creation with negative surface area', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => -30,
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('hectareas');
});

it('rejects lot creation that exceeds field surface', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 150, // Exceeds field surface
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('hectareas');
});

it('rejects lot creation when sum of lots would exceed field surface', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);
    Lote::factory()->for($campo)->create(['hectareas' => 60]);

    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test 2',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 50, // 60 + 50 = 110 > 100
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('hectareas');
});

it('allows multiple lots when sum does not exceed field surface', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $this->postJson('/api/lotes', [
        'nombre' => 'Lote 1',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 30,
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ])->assertCreated();

    $this->postJson('/api/lotes', [
        'nombre' => 'Lote 2',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 40,
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ])->assertCreated();

    $this->postJson('/api/lotes', [
        'nombre' => 'Lote 3',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 30,
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ])->assertCreated();

    // All lots should be created (30 + 40 + 30 = 100)
    $this->assertDatabaseCount('lotes', 3);
    $this->assertEquals(100, $campo->lotes()->sum('hectareas'));
});

it('rejects lot update that would exceed field surface', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);
    $lote = Lote::factory()->for($campo)->create(['hectareas' => 30]);
    Lote::factory()->for($campo)->create(['hectareas' => 60]);

    $response = $this->putJson("/api/lotes/{$lote->id}", [
        'nombre' => 'Lote Updated',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 50, // 50 + 60 = 110 > 100
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertStatus(422);
    $this->assertDatabaseHas('lotes', [
        'id' => $lote->id,
        'hectareas' => 30, // Should remain unchanged
    ]);
});

it('allows lot update when sum remains within field surface', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);
    $lote = Lote::factory()->for($campo)->create(['hectareas' => 30]);
    Lote::factory()->for($campo)->create(['hectareas' => 40]);

    $response = $this->putJson("/api/lotes/{$lote->id}", [
        'nombre' => 'Lote Updated',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 35, // 35 + 40 = 75 < 100
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('lotes', [
        'id' => $lote->id,
        'hectareas' => 35,
    ]);
});

it('allows lot transfer to another field if sum validates', function () {
    $campo1 = Campo::factory()->create(['hectareas' => 100]);
    $campo2 = Campo::factory()->create(['hectareas' => 200]);
    $lote = Lote::factory()->for($campo1)->create(['hectareas' => 80]);

    $response = $this->putJson("/api/lotes/{$lote->id}", [
        'nombre' => 'Lote Transferred',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 80,
        'campo_id' => $campo2->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('lotes', [
        'id' => $lote->id,
        'campo_id' => $campo2->id,
    ]);
});

it('rejects lot creation with zero surface area', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 0,
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => 1.5,
    ]);

    $response->assertStatus(422);
});

it('validates ph range between 0 and 14', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    // pH too low
    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 50,
        'campo_id' => $campo->id,
        'ph' => -1,
        'napa' => 1.5,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('ph');

    // pH too high
    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 50,
        'campo_id' => $campo->id,
        'ph' => 15,
        'napa' => 1.5,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('ph');
});

it('rejects lot creation with negative napa depth', function () {
    $campo = Campo::factory()->create(['hectareas' => 100]);

    $response = $this->postJson('/api/lotes', [
        'nombre' => 'Lote Test',
        'caracteristicas' => 'Suelo fértil',
        'estado' => 'produccion',
        'latitud' => '-34.5',
        'longitud' => '-58.5',
        'hectareas' => 50,
        'campo_id' => $campo->id,
        'ph' => 7,
        'napa' => -2,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('napa');
});
