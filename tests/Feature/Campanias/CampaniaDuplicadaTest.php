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