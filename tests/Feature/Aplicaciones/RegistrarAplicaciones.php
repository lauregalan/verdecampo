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
