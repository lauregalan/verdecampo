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

    // 2. Forzamos fechas específicas para que abarque todo el año
    $campaniaActiva = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'En Curso',
            'fecha_inicio' => '2026-01-01',
            'fecha_fin' => '2026-12-31',
        ])
        ->create();
    $campaniaActiva->lotes()->attach($lote);

    // 3. Forzamos fechas que se SUPERPONEN con la campaña activa (Ej: en Junio)
    $campaniaPlanificada = Campania::factory()
        ->for($campo)
        ->for($cultivo)
        ->state([
            'estado' => 'Planificada',
            'fecha_inicio' => '2026-06-01', // <-- Acá está el choque garantizado
            'fecha_fin' => '2026-10-01',
        ])
        ->create();
    $campaniaPlanificada->lotes()->attach($lote);

    // 4. Pasamos las fechas estáticas en el payload para evitar errores de Carbon/Formato
    $response = $this->putJson("/api/campanias/{$campaniaPlanificada->id}", [
        'campo_id' => $campo->id,
        'cultivo_id' => $cultivo->id,
        'nombre' => $campaniaPlanificada->nombre,
        'fecha_inicio' => '2026-06-01',
        'fecha_fin' => '2026-10-01',
        'estado' => 'En Curso', // <- El cambio conflictivo
        'lote_ids' => [$lote->id],
    ]);

    // 5. Exigimos estrictamente el 422 y que el error esté en el array 'lotes'
    $response->assertStatus(422)
             ->assertJsonValidationErrors(['lotes']);
});
