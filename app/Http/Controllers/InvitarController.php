<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Mail\InvitacionColaborador;
use App\Models\User;

class InvitarController extends Controller
{
    public function __construct() {}

    public function generarInvitacion(Request $request, $userId): JsonResponse
    {
        try {
            // Validar que el usuario que invita existe
            $usuarioInvitador = User::find($userId);
            if (!$usuarioInvitador) {
                return response()->json([
                    'error' => 'El usuario que invita no existe',
                ], 404);
            }

            // Validar el email extraído del request
            $validated = $request->validate([
                'email' => ['required', 'email', 'max:255'],
            ]);

            $emailInvitado = $validated['email'];

            // Verificar que el email invitado no sea el mismo que el del invitador
            if ($emailInvitado === $usuarioInvitador->email) {
                return response()->json([
                    'error' => 'No puedes invitarte a ti mismo',
                ], 422);
            }

            // Generación de la URL firmada (válida por 48 horas)
            $url = URL::temporarySignedRoute(
                'invitation.accept',
                now()->addDays(2),
                ['email' => $emailInvitado]
            );

            // Registrar al usuario si aún no existe
            $usuario = User::firstOrCreate(
                ['email' => $emailInvitado],
                [
                    'name'     => ucfirst(explode('@', $emailInvitado)[0]),
                    'password' => Hash::make(str()->random(32)),
                    'email_verified_at' => null, // Estado "Pendiente"
                ]
            );

            // Intentar enviar el email
            try {
                Mail::to($emailInvitado)->send(new InvitacionColaborador($url));
                
                Log::info('Invitación enviada correctamente', [
                    'email_destino' => $emailInvitado,
                    'id_invitador' => $userId,
                    'id_usuario_creado' => $usuario->id,
                ]);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Invitación enviada correctamente a ' . $emailInvitado,
                    'usuario_id' => $usuario->id,
                ], 201);

            } catch (\Exception $mailException) {
                Log::error('Error al enviar invitación por email', [
                    'email' => $emailInvitado,
                    'error' => $mailException->getMessage(),
                ]);

                return response()->json([
                    'error' => 'Error al enviar el email. Por favor intenta de nuevo.',
                    'debug' => $mailException->getMessage(),
                ], 500);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validación fallida',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error inesperado en generarInvitacion', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return response()->json([
                'error' => 'Ocurrió un error inesperado',
            ], 500);
        }
    }
}