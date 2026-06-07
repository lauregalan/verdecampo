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

function actingAsProductor(): void
{
    Role::findOrCreate('Productor', 'web');
    $user = User::factory()->create();
    $user->assignRole('Productor');
    Sanctum::actingAs($user);
}

it('crea una campaña en el pasado y fuerza el estado a finalizada', function () {
    actingAsProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $data = [
        'nombre' => 'Soja Histórica',
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'fecha_inicio' => Carbon::now()->subMonths(6)->toDateString(),
        'fecha_fin' => Carbon::now()->subMonths(1)->toDateString(),
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    // Reemplazamos post() por postJson()
    $this->postJson('/api/campanias', $data)->assertSuccessful();

    $this->assertDatabaseHas('campanias', [
        'nombre' => 'Soja Histórica',
        'estado' => 'Finalizada',
    ]);
});

it('crea una campaña actual y le asigna el estado en curso', function () {
    actingAsProductor();

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $data = [
        'nombre' => 'Maíz Actual',
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'fecha_inicio' => Carbon::now()->subDays(10)->toDateString(),
        'fecha_fin' => Carbon::now()->addMonths(4)->toDateString(),
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    $this->postJson('/api/campanias', $data)->assertSuccessful();

    $this->assertDatabaseHas('campanias', [
        'nombre' => 'Maíz Actual',
        'estado' => 'En Curso',
    ]);
});

it('falla al crear una campaña si sus lotes se solapan con otra en las mismas fechas', function () {
    actingAsProductor(); // Faltaba la autenticación

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $campaniaExistente = Campania::factory()->create([
        'campo_id' => $campo->id, // Faltaba asegurar el mismo campo
        'cultivo_id' => $cultivo->id,
        'fecha_inicio' => '2025-01-01',
        'fecha_fin' => '2025-06-01',
    ]);
    $campaniaExistente->lotes()->attach($lote->id);

    $data = [
        'nombre' => 'Campaña Invasora',
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'fecha_inicio' => '2025-03-01', // Choque de fechas
        'fecha_fin' => '2025-08-01',
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    $this->postJson('/api/campanias', $data)
         ->assertStatus(422)
         ->assertJsonValidationErrors(['lotes']);
});


it('permite actualizar una campaña sin generar conflicto consigo misma', function () {
    actingAsProductor(); // Faltaba la autenticación

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $campania = Campania::factory()->create([
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'fecha_inicio' => '2025-01-01',
        'fecha_fin' => '2025-06-01',
    ]);
    $campania->lotes()->attach($lote->id);

    // Enviamos el payload completo por seguridad para el PUT
    $data = [
        'nombre' => 'Nombre Actualizado',
        'campo_id' => $campania->campo_id,
        'cultivo_id' => $campania->cultivo_id,
        'fecha_inicio' => is_string($campania->fecha_inicio) ? $campania->fecha_inicio : $campania->fecha_inicio->toDateString(),
        'fecha_fin' => is_string($campania->fecha_fin) ? $campania->fecha_fin : $campania->fecha_fin->toDateString(),
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    $this->putJson("/api/campanias/{$campania->id}", $data)->assertSuccessful();

    $this->assertDatabaseHas('campanias', [
        'id' => $campania->id,
        'nombre' => 'Nombre Actualizado',
    ]);
});

it('falla al actualizar una campaña si las nuevas fechas pisan a una campaña vecina', function () {
    actingAsProductor(); // Faltaba la autenticación

    $campo = Campo::factory()->create();
    $cultivo = Cultivo::factory()->create();
    $lote = Lote::factory()->for($campo)->create();

    $campaniaA = Campania::factory()->create([
        'campo_id' => $campo->id, // Mismo campo
        'cultivo_id' => $cultivo->id,
        'fecha_inicio' => '2025-01-01',
        'fecha_fin' => '2025-06-01',
    ]);
    $campaniaA->lotes()->attach($lote->id);

    $campaniaB = Campania::factory()->create([
        'campo_id' => $campo->id, // Mismo campo
        'cultivo_id' => $cultivo->id,
        'fecha_inicio' => '2025-07-01',
        'fecha_fin' => '2025-12-01',
    ]);
    $campaniaB->lotes()->attach($lote->id);

    $data = [
        'nombre' => $campaniaB->nombre,
        'campo_id' => $campaniaB->campo_id,
        'cultivo_id' => $campaniaB->cultivo_id,
        'fecha_inicio' => '2025-05-01', // Estiramos hacia atrás para que pise a Campaña A
        'fecha_fin' => '2025-12-01',
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    $this->putJson("/api/campanias/{$campaniaB->id}", $data)
         ->assertStatus(422)
         ->assertJsonValidationErrors(['lotes']);
});
