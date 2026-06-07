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

// Función de ayuda para asegurar que el test está autenticado como Productor
function loguearProductor() {
    Role::findOrCreate('Productor', 'web');
    $user = User::factory()->create();
    $user->assignRole('Productor');
    Sanctum::actingAs($user);
}

it('prevents creating duplicate campaigns with exact same content but different name', function () {
    loguearProductor(); // <-- Autenticamos la petición

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    // campaña original
    $campaniaOriginal = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'nombre' => 'Campaña Trigo Original',
            'fecha_inicio' => '2026-09-01',
            'fecha_fin' => '2026-12-31',
        ])
        ->create();
    $campaniaOriginal->lotes()->attach($lote);

    // mismos datos
    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Campaña Trigo Copia', // Este es el único dato distinto
        'fecha_inicio' => '2026-09-01',
        'fecha_fin' => '2026-12-31',
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ]);

    // Usamos 422, que es el código correcto de validación
    $response->assertStatus(422)->assertJsonValidationErrors(['nombre']);
});

it('prevents creating a new active campaign if the lot already has one active', function () {
    loguearProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    // Campaña activa en el primer semestre
    $campaniaActiva = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'En Curso',
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-06-30',
        ])
        ->create();
    $campaniaActiva->lotes()->attach($lote);

    // Intentamos crear otra campaña que empiece en MAYO (¡Solapamiento!)
    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Nueva Campaña Invasora',
        'fecha_inicio' => '2026-05-01', // Choca con la activa
        'fecha_fin' => '2026-12-31',
        'estado' => 'En Curso',
        'lote_ids' => [$lote->id],
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['lotes']);
});

it('prevents updating a planned campaign to active if the lot already has an active campaign', function () {
    loguearProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    // Campaña activa todo el año
    $campaniaActiva = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'En Curso',
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-12-31',
        ])
        ->create();
    $campaniaActiva->lotes()->attach($lote);

    // Campaña planificada
    $campaniaPlanificada = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'Planificada',
            'fecha_inicio' => '2026-06-01', // Choca con la activa
            'fecha_fin' => '2026-10-01',
        ])
        ->create();
    $campaniaPlanificada->lotes()->attach($lote);

    // Intentamos actualizar a Activa
    $response = $this->putJson("/api/campanias/{$campaniaPlanificada->id}", [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => $campaniaPlanificada->nombre,
        'fecha_inicio' => $campaniaPlanificada->fecha_inicio,
        'fecha_fin' => $campaniaPlanificada->fecha_fin,
        'estado' => 'En Curso', // <- El cambio conflictivo
        'lote_ids' => [$lote->id],
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['lotes']);
});
