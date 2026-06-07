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

it('prevents creating duplicate campaigns with exact same content but different name', function () {
    actingAsProductor();

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

    // mismos datose
    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Campaña Trigo Copia', // Este es el único dato distinto
        'fecha_inicio' => '2026-09-01',
        'fecha_fin' => '2026-12-31',
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ]);

    $response->assertInvalid();
});

it('prevents creating a new active campaign if the lot already has one active', function () {
    actingAsProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    // campaña activa
    $campaniaActiva = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'Activa',
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-06-30',
        ])
        ->create();
    $campaniaActiva->lotes()->attach($lote);

    // otra activa
    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Nueva Campaña de Verano',
        'fecha_inicio' => '2026-07-01', 
        'fecha_fin' => '2026-12-31',
        'estado' => 'Activa',
        'lote_ids' => [$lote->id],
    ]);


    $response->assertInvalid();
});

it('prevents updating a planned campaign to active if the lot already has an active campaign', function () {
    actingAsProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    // campaña actualmente activa
    $campaniaActiva = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state(['estado' => 'Activa'])
        ->create();
    $campaniaActiva->lotes()->attach($lote);

    // campaña planificada en el mismo lote
    $campaniaPlanificada = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state(['estado' => 'Planificada'])
        ->create();
    $campaniaPlanificada->lotes()->attach($lote);

    // actualizar planificada a act
    $response = $this->putJson("/api/campanias/{$campaniaPlanificada->id}", [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => $campaniaPlanificada->nombre,
        'fecha_inicio' => $campaniaPlanificada->fecha_inicio,
        'fecha_fin' => $campaniaPlanificada->fecha_fin,
        'estado' => 'Activa', // <- El cambio conflictivo
        'lote_ids' => [$lote->id],
    ]);

    $response->assertInvalid();
});