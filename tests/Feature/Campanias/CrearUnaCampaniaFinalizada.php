<?php

use App\Models\Campania;
use App\Models\Lote;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\post;
use function Pest\Laravel\put;
use function Pest\Laravel\assertDatabaseHas;


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
    $lote = Lote::factory()->create();

    $data = [
        'nombre' => 'Soja Histórica',
        'campo_id' => $lote->campo_id,
        'fecha_inicio' => Carbon::now()->subMonths(6)->toDateString(),
        'fecha_fin' => Carbon::now()->subMonths(1)->toDateString(),
        'estado' => 'Planificada',
        'lote_ids' => [$lote->id],
    ];

    post('/campanias', $data)->assertRedirect();


    assertDatabaseHas('campanias', [
        'nombre' => 'Soja Histórica',
        'estado' => 'Finalizada',
    ]);
});

it('crea una campaña actual y le asigna el estado en curso', function () {
    actingAsProductor();
    $lote = Lote::factory()->create();

    $data = [
        'nombre' => 'Maíz Actual',
        'campo_id' => $lote->campo_id,
        'fecha_inicio' => Carbon::now()->subDays(10)->toDateString(),
        'fecha_fin' => Carbon::now()->addMonths(4)->toDateString(),
        'lote_ids' => [$lote->id],
    ];

    post('/campanias', $data)->assertRedirect();

    assertDatabaseHas('campanias', [
        'nombre' => 'Maíz Actual',
        'estado' => 'En Curso',
    ]);
});

it('falla al crear una campaña si sus lotes se solapan con otra en las mismas fechas', function () {
    $lote = Lote::factory()->create();


    $campaniaExistente = Campania::factory()->create([
        'fecha_inicio' => '2025-01-01',
        'fecha_fin' => '2025-06-01',
    ]);
    $campaniaExistente->lotes()->attach($lote->id);


    $data = [
        'nombre' => 'Campaña Invasora',
        'campo_id' => $lote->campo_id,
        'fecha_inicio' => '2025-03-01',
        'fecha_fin' => '2025-08-01',
        'lote_ids' => [$lote->id],
    ];


    post('/campanias', $data)->assertInvalid(['lotes']);
});


it('permite actualizar una campaña sin generar conflicto consigo misma', function () {
    $lote = Lote::factory()->create();

    $campania = Campania::factory()->create([
        'fecha_inicio' => '2025-01-01',
        'fecha_fin' => '2025-06-01',
        'campo_id' => $lote->campo_id,
    ]);
    $campania->lotes()->attach($lote->id);


    $data = [
        'nombre' => 'Nombre Actualizado',
    ];


    put("/campanias/{$campania->id}", $data)->assertRedirect();

    assertDatabaseHas('campanias', [
        'id' => $campania->id,
        'nombre' => 'Nombre Actualizado',
    ]);
});

it('falla al actualizar una campaña si las nuevas fechas pisan a una campaña vecina', function () {
    $lote = Lote::factory()->create();


    $campaniaA = Campania::factory()->create([
        'fecha_inicio' => '2025-01-01',
        'fecha_fin' => '2025-06-01',
    ]);
    $campaniaA->lotes()->attach($lote->id);


    $campaniaB = Campania::factory()->create([
        'fecha_inicio' => '2025-07-01',
        'fecha_fin' => '2025-12-01',
    ]);
    $campaniaB->lotes()->attach($lote->id);


    $data = [
        'fecha_inicio' => '2025-05-01',
    ];

    put("/campanias/{$campaniaB->id}", $data)->assertInvalid(['lotes']);
});
