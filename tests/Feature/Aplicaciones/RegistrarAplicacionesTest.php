<?php

use App\Models\Aplicacion;
use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use App\Models\Lote;
use App\Models\ProductoAplicacion;
use App\Models\TipoAplicacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('does not register an application on an invalid campaign status', function (string $estadoCampania) {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state(['estado' => $estadoCampania])
        ->create();

    $lote = Lote::factory()->for($campo)->create();
    $campania->lotes()->attach($lote);

    $productoAplicacion = ProductoAplicacion::factory()->create();
    $tipoAplicacion = TipoAplicacion::factory()->create();

    $payload = Aplicacion::factory()
        ->for($productoAplicacion, 'productoAplicacion')
        ->for($tipoAplicacion, 'tipoAplicacion')
        ->for($campania, 'campania')
        ->for($lote, 'lote')
        ->make()
        ->getAttributes();

    $response = $this->postJson('/api/aplicaciones', $payload);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['campania_id'])
        ->assertJsonPath(
            'errors.campania_id.0',
            'Solo se pueden registrar aplicaciones en campanias en curso.'
        );

    $this->assertDatabaseCount('aplicaciones', 0);
})->with([
    'planificada' => 'Planificada',
    'finalizada' => 'Finalizada',
    'cancelada' => 'Cancelada',
]);

it('does not register an application before campaign start date', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'En Curso',
            'fecha_inicio' => '2026-01-10',
            'fecha_fin' => '2026-02-10',
        ])
        ->create();

    $lote = Lote::factory()->for($campo)->create();
    $campania->lotes()->attach($lote);

    $payload = Aplicacion::factory()
        ->for(ProductoAplicacion::factory()->create(), 'productoAplicacion')
        ->for(TipoAplicacion::factory()->create(), 'tipoAplicacion')
        ->for($campania, 'campania')
        ->for($lote, 'lote')
        ->state(['fecha' => '2026-01-09'])
        ->make()
        ->getAttributes();

    $response = $this->postJson('/api/aplicaciones', $payload);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['fecha'])
        ->assertJsonPath(
            'errors.fecha.0',
            'La fecha de aplicacion no puede ser anterior al inicio de la campania.'
        );

    $this->assertDatabaseCount('aplicaciones', 0);
});

it('does not register an application after campaign end date', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $campania = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'En Curso',
            'fecha_inicio' => '2026-01-10',
            'fecha_fin' => '2026-02-10',
        ])
        ->create();

    $lote = Lote::factory()->for($campo)->create();
    $campania->lotes()->attach($lote);

    $payload = Aplicacion::factory()
        ->for(ProductoAplicacion::factory()->create(), 'productoAplicacion')
        ->for(TipoAplicacion::factory()->create(), 'tipoAplicacion')
        ->for($campania, 'campania')
        ->for($lote, 'lote')
        ->state(['fecha' => '2026-02-11'])
        ->make()
        ->getAttributes();

    $response = $this->postJson('/api/aplicaciones', $payload);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['fecha'])
        ->assertJsonPath(
            'errors.fecha.0',
            'La fecha de aplicacion no puede ser posterior al fin de la campania.'
        );

    $this->assertDatabaseCount('aplicaciones', 0);
});
