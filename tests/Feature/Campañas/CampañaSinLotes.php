<?php


use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;


uses(RefreshDatabase::class);

it('has campañas/campañasinlotes page', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $campo = Campo::factory()->create();

    $cultivo = Cultivo::factory()->create();

    $campain = Campania::factory()
    ->for($campo)
    ->for($cultivo)
    ->make()
    ->getAttributes();
    
    $campain['lote_ids']=[];

    $respuesta = $this->postJson('/api/campanias', $campain);

    $respuesta
    ->assertStatus(422)
    ->assertJsonValidationErrors(['lote_ids'])
    ->assertJsonPath(
            'errors.lote_id.0',
            'No se pueden registrar campañas sin lotes asociados.'
        );

     $this->assertDatabaseCount('campanias', 0);
});
