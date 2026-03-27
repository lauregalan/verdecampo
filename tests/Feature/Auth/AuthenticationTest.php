<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_inactive_users_can_not_authenticate_using_the_login_screen(): void
    {
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
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_inactive_authenticated_users_are_logged_out_on_the_next_request(): void
    {
        $user = User::factory()->create([
            'active' => false,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response
            ->assertRedirect('/login')
            ->assertSessionHas('status', 'Tu cuenta fue desactivada. Contacta a un productor para reactivarla.');

        $this->assertGuest();
    }
}
