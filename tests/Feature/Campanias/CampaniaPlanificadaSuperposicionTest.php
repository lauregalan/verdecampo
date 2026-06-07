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

