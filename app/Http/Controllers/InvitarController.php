<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvitarRequest;
use App\Services\InvitarService; 
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class InvitarController extends Controller
{
    protected $InvitarService;

    public function __construct(InvitarService $InvitarService) 
    {
        $this->InvitarService = $InvitarService;
    }

    public function generarInvitacion(InvitarRequest $request): JsonResponse
    {
        $email = $request->validated('email');

        try {

            $usuario = $this->InvitarService->generarYEnviar($email);

            return response()->json([
                'status'  => 'success',
                'message' => 'Invitación enviada correctamente a ' . $email,
                'usuario_id' => $usuario->id,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error inesperado al generar/enviar invitación', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Ocurrió un error inesperado al procesar la invitación.',
            ], 500);
        }
    }
}