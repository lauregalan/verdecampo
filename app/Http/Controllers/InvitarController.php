<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LoteService;
use App\Models\Lote;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\LoteRequest;
use App\Http\Requuests\StoreLoteRequest;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvitacionColaborador;   

class InvitarController extends Controller{
        
    public function __construct() {}

    public function generarInvitacion(Request $request, $userId): JsonResponse
    {
        $emailInvitado = $request->json('email');

        if (!$emailInvitado) {
            return response()->json([
                'error' => 'El campo email no llegó al servidor',
                'debug_recibido' => $request->all() 
            ], 422);
        }
        //creacion del hash 
        $url = URL::temporarySignedRoute(
            'invitation.accept', 
            now()->addDays(2), 
            ['email' => $emailInvitado]
        );

        /* { ejemplo de request
            "email": "colaborador@ejemplo.com",
            "role": "ingeniero",
        } */

        //facade mail para enviar el mailable 
        Mail::to($emailInvitado)->send(new InvitacionColaborador($url));


        return response()->json([
            'status' => 'success',
            'message' => 'Invitación enviada correctamente a ' . $emailInvitado
        ]);
    }
}