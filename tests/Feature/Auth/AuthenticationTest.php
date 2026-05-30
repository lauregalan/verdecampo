<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create([
        'password' => 'password',
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('campo', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create([
        'password' => 'password',
    ]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('inactive users can not authenticate using the login screen', function () {
    $user = User::factory()->create([
        'active' => false,
        'password' => 'password',
    ]);

    $response = $this->from('/login')->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response
        ->assertRedirect('/login')
        ->assertSessionHasErrors([
            'email' => 'Tu cuenta esta desactivada. Contacta a un productor para reactivarla.',
        ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('inactive authenticated users are logged out on the next request', function () {
    $user = User::factory()->create([
        'active' => false,
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response
        ->assertRedirect('/login')
        ->assertSessionHas('status', 'Tu cuenta fue desactivada. Contacta a un productor para reactivarla.');

    $this->assertGuest();
});
