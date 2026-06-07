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




it('prevents creating campaign when another campaign exists with same field and overlapping lots', function () {


    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote1 = Lote::factory()->for($campo)->create();
    $lote2 = Lote::factory()->for($campo)->create();

    $campania1 = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-06-30',
        ])
        ->create();
    $campania1->lotes()->attach($lote1);

    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Campaña conflictiva',
        'fecha_inicio' => '2026-03-01',
        'fecha_fin' => '2026-07-31',
        'estado' => 'Planificada',
        'lote_ids' => [$lote1->id],
    ]);

    $response->assertInvalid(['lotes']);
});

it('allows creating campaign with same field but different lots', function () {


    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote1 = Lote::factory()->for($campo)->create();
    $lote2 = Lote::factory()->for($campo)->create();


    $campania1 = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-06-30',
        ])
        ->create();
    $campania1->lotes()->attach($lote1);

    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Campaña sin conflicto',
        'fecha_inicio' => '2026-03-01',
        'fecha_fin' => '2026-07-31',
        'estado' => 'Planificada',
        'lote_ids' => [$lote2->id],
    ]);

    $response->assertCreated();
    expect(Campania::count())->toBe(2);
});

it('allows creating campaign with same field and lots but non-overlapping dates', function () {
    actingAsProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $campania1 = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-06-30',
        ])
        ->create();
    $campania1->lotes()->attach($lote);

    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Campaña sin sobreposición',
        'fecha_inicio' => '2026-07-01',
        'fecha_fin' => '2026-12-31',
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ]);

    $response->assertCreated();
    expect(Campania::count())->toBe(2);
});

it('allows creating campaign in different field even with overlapping dates', function () {
    actingAsProductor();

    $campo1 = Campo::factory()->create();
    $campo2 = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote1 = Lote::factory()->for($campo1)->create();
    $lote2 = Lote::factory()->for($campo2)->create();


    $campania1 = Campania::factory()
        ->for($campo1)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-06-30',
        ])
        ->create();
    $campania1->lotes()->attach($lote1);


    $response = $this->postJson('/api/campanias', [
        'campo_id' => $campo2->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => 'Campaña en otro campo',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'Planificada',
        'lote_ids' => [$lote2->id],
    ]);

    $response->assertCreated();
    expect(Campania::count())->toBe(2);
});

it('prevents updating campaign when conflict arises with another campaign', function () {
    actingAsProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote1 = Lote::factory()->for($campo)->create();
    $lote2 = Lote::factory()->for($campo)->create();

    // Crear dos campañas sin conflicto
    $campania1 = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-03-31',
        ])
        ->create();
    $campania1->lotes()->attach($lote1);

    $campania2 = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-06-01',
            'fecha_fin' => '2026-08-31',
        ])
        ->create();
    $campania2->lotes()->attach($lote2);


    $response = $this->putJson(
        "/api/campanias/{$campania1->id}",
        [
            'campo_id' => $campo->id,
            'cultivo_id' => $cultivo->id,
            'nombre' => $campania1->nombre,
            'fecha_inicio' => '2026-06-15',
            'fecha_fin' => '2026-09-30',
            'estado' => 'Planificada',
            'lote_ids' => [$lote2->id],
        ],
    );

    $response->assertUnprocessable();

});

it('allows updating campaign when staying within own date range', function () {
    actingAsProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote1 = Lote::factory()->for($campo)->create();

    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-06-30',
        ])
        ->create();
    $campania->lotes()->attach($lote1);


    $response = $this->putJson(
        "/api/campanias/{$campania->id}",
        [
            'campo_id' => $campo->id,
            'cultivo_id' => $cultivo->id,
            'nombre' => 'Campaña actualizada',
            'fecha_inicio' => '2026-02-01',
            'fecha_fin' => '2026-05-31',
            'estado' => 'En Curso',
            'lote_ids' => [$lote1->id],
        ],
    );

    $response->assertOk();
    expect($campania->fresh()->nombre)->toBe('Campaña actualizada');
});
