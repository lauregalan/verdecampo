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

it('falla al intentar crear una campaña que es un duplicado exacto de otra', function () {


    $lote = Lote::factory()->create();


    $campaniaOriginal = Campania::factory()->create([
        'campo_id' => $lote->campo_id,
        'cultivo_id' => 1,
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-01',
    ]);
    $campaniaOriginal->lotes()->attach($lote->id);


    $dataClon = [
        'nombre' => 'Intento de Clon Falso',
        'campo_id' => $campaniaOriginal->campo_id,
        'cultivo_id' => $campaniaOriginal->cultivo_id,
        'fecha_inicio' => $campaniaOriginal->fecha_inicio,
        'fecha_fin' => $campaniaOriginal->fecha_fin,
        'lote_ids' => [$lote->id],
    ];


    post('/campanias', $dataClon)->assertInvalid(['nombre']);
});

it('falla al actualizar una campaña si sus nuevos datos la convierten en un duplicado exacto', function () {
    $lote = Lote::factory()->create();


    $campaniaOriginal = Campania::factory()->create([
        'campo_id' => $lote->campo_id,
        'cultivo_id' => 1,
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-01',
    ]);
    $campaniaOriginal->lotes()->attach($lote->id);


    $campaniaSecundaria = Campania::factory()->create([
        'campo_id' => $lote->campo_id,
        'cultivo_id' => 2,
        'fecha_inicio' => '2026-07-01',
        'fecha_fin' => '2026-12-01',
    ]);
    $campaniaSecundaria->lotes()->attach($lote->id);


    $dataMutacion = [
        'cultivo_id' => $campaniaOriginal->cultivo_id,
        'fecha_inicio' => $campaniaOriginal->fecha_inicio,
        'fecha_fin' => $campaniaOriginal->fecha_fin,
        'lote_ids' => [$lote->id],
    ];


    put("/campanias/{$campaniaSecundaria->id}", $dataMutacion)->assertInvalid(['nombre']);
});
