<?php

use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use App\Models\Lote;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);


it('falla al intentar crear una campaña que es un duplicado exacto de otra', function () {
    loguearProductor(); // Autenticamos

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $campaniaOriginal = Campania::factory()->create([
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id, // Usamos el ID real
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-01',
    ]);
    $campaniaOriginal->lotes()->attach($lote->id);

    $dataClon = [
        'nombre' => 'Intento de Clon Falso',
        'campo_id' => $campaniaOriginal->campo_id,
        'cultivo_id' => $campaniaOriginal->cultivo_id,
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-01',
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    // Usamos postJson y esperamos el 422
    $this->postJson('/api/campanias', $dataClon)
         ->assertStatus(422)
         ->assertJsonValidationErrors(['nombre']);
});

it('falla al actualizar una campaña si sus nuevos datos la convierten en un duplicado exacto', function () {
    loguearProductor(); // Autenticamos

    $campo = Campo::factory()->create();
    $cultivo1 = Cultivo::factory()->create();
    $cultivo2 = Cultivo::factory()->create(); // Necesitamos 2 cultivos distintos
    $lote = Lote::factory()->for($campo)->create();

    $campaniaOriginal = Campania::factory()->create([
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo1->id,
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-01',
    ]);
    $campaniaOriginal->lotes()->attach($lote->id);

    $campaniaSecundaria = Campania::factory()->create([
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo2->id,
        'fecha_inicio' => '2026-07-01',
        'fecha_fin' => '2026-12-01',
    ]);
    $campaniaSecundaria->lotes()->attach($lote->id);

    // Payload completo para el UPDATE
    $dataMutacion = [
        'nombre' => $campaniaSecundaria->nombre,
        'campo_id' => $campo->id,
        'cultivo_id' => $campaniaOriginal->cultivo_id, // Copiamos el cultivo
        'fecha_inicio' => '2026-01-01',               // Copiamos fechas
        'fecha_fin' => '2026-06-01',
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    $this->putJson("/api/campanias/{$campaniaSecundaria->id}", $dataMutacion)
         ->assertStatus(422)
         ->assertJsonValidationErrors(['nombre']);
});
