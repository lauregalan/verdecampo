<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AceptarInvitacionController extends Controller
{
    /**
     * Renderiza la pantalla de cambio de contraseña para el usuario invitado.
     */
    public function show($email): Response
    {
        try {
            // Validar que el email sea un formato válido
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Log::warning('Intento de acceder a invitación con email inválido', [
                    'email' => $email,
                    'ip' => request()->ip(),
                ]);

                return Inertia::render('Auth/ErrorInvitacion', [
                    'mensaje' => 'El formato del email en el enlace no es válido.',
                ]);
            }

            // Verificar que el usuario exista en la base de datos
            $user = User::where('email', $email)->first();

            if (!$user) {
                Log::warning('Intento de acceder a invitación con email no registrado', [
                    'email' => $email,
                    'ip' => request()->ip(),
                ]);

                return Inertia::render('Auth/ErrorInvitacion', [
                    'mensaje' => 'El usuario con este email no existe o la invitación ha expirado.',
                ]);
            }

            // Verificar si el usuario ya completó su registro
            if ($user->email_verified_at) {
                Log::info('Usuario invitado intenta acceder pero ya está verificado', [
                    'user_id' => $user->id,
                    'email' => $email,
                ]);

                return Inertia::render('Auth/ErrorInvitacion', [
                    'mensaje' => 'Tu cuenta ya ha sido activada. Por favor inicia sesión.',
                ]);
            }

            return Inertia::render('Auth/AceptarInvitacion', [
                'email' => $email,
            ]);

        } catch (\Exception $e) {
            Log::error('Error inesperado en show de aceptarInvitacion', [
                'error' => $e->getMessage(),
                'email' => $email,
            ]);

            return Inertia::render('Auth/ErrorInvitacion', [
                'mensaje' => 'Ocurrió un error al procesar tu invitación. Intenta de nuevo más tarde.',
            ]);
        }
    }

    /**
     * Actualiza la contraseña del usuario invitado y lo considera verificado.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'email'                 => ['required', 'email', 'exists:users,email'],
                'password'              => ['required', 'string', 'min:8', 'confirmed'],
                'password_confirmation' => ['required', 'string'],
            ]);

            $user = User::where('email', $validated['email'])->firstOrFail();

            // Verificar que el usuario aún no ha completado su registro
            if ($user->email_verified_at) {
                Log::warning('Intento de cambiar contraseña en usuario ya verificado', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
                
                return Redirect::route('login')->with(
                    'error',
                    'Este usuario ya ha completado su registro. Por favor, inicia sesión.'
                );
            }

            $user->update([
                'password'           => Hash::make($validated['password']),
                'email_verified_at'  => now(),
            ]);

            Log::info('Usuario completó el registro desde invitación', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return Redirect::route('login')->with(
                'status',
                '¡Contraseña configurada exitosamente! Ya podés iniciar sesión.'
            );
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Error de validación en aceptar invitación', [
                'errors' => $e->errors(),
            ]);
            
            return back()->withErrors($e->errors());
            
        } catch (\Exception $e) {
            Log::error('Error inesperado en aceptarInvitacion', [
                'error' => $e->getMessage(),
            ]);
            
            return Redirect::route('login')->with(
                'error',
                'Ocurrió un error. Por favor intenta de nuevo.'
            );
        }
    }
}
