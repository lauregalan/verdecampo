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


function campaniaPayload(Campania $campania, string $estado, array $loteIds): array
{
    return [
        'campo_id' => $campania->campo_id,
        'cultivo_id' => $campania->cultivo_id,
        'nombre' => $campania->nombre,
        'fecha_inicio' => $campania->fecha_inicio,
        'fecha_fin' => $campania->fecha_fin,
        'estado' => $estado,
        'lote_ids' => $loteIds,
    ];
}

it('updates campaign lots to production when campaign starts', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->state(['estado' => 'disponible'])->create();

    // Forzamos fechas para que el backend acepte "En Curso"
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'Planificada',
            'fecha_inicio' => now()->subDays(5)->toDateString(), // Arrancó hace 5 días
            'fecha_fin' => now()->addMonths(3)->toDateString(),  // Termina en 3 meses
        ])
        ->create();

    $campania->lotes()->attach($lote);

    $response = $this->putJson(
        "/api/campanias/{$campania->id}",
        campaniaPayload($campania, 'En Curso', [$lote->id]),
    );

    $response->assertOk();

    expect($lote->fresh()->estado)->toBe('produccion');
});

it('updates campaign lots to available when campaign finishes', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->state(['estado' => 'produccion'])->create();

    // Forzamos fechas para que el backend la clasifique sí o sí como "Finalizada"
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'En Curso',
            'fecha_inicio' => now()->subMonths(6)->toDateString(),
            'fecha_fin' => now()->subDays(2)->toDateString(), // ¡Terminó hace 2 días!
        ])
        ->create();

    $campania->lotes()->attach($lote);

    $response = $this->putJson(
        "/api/campanias/{$campania->id}",
        campaniaPayload($campania, 'Finalizada', [$lote->id]),
    );

    $response->assertOk();

    expect($lote->fresh()->estado)->toBe('disponible');
});
