<?php


use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;


uses(RefreshDatabase::class);


it('A User cant change his own role', function () {
    Role::findOrCreate('Productor', 'web');

    $user = User::factory()->create();
    $user->assignRole('Productor');

    Sanctum::actingAs($user);

    $userid = $user->id;
    $payload = ['roles' => ['Ingeniero']];

    $response = $this->putJson("/api/users/{$userid}/roles", $payload);

    $response->assertStatus(403,'El usuario no puede modificarse sus propio rol');
});
