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

class InvitarController extends Controller{

    public function generarInvitacion(Request $request, $userId): JsonResponse
    {
        $link = URL::temporarySignedRoute(
            'invitation.accept', 
            now()->addDays(2),   
            ['user' => $userId]  
        );

        Mail::to($request->email)->send(new InvitacionColaborador($link));

        return response()->json(['message' => 'Invitación enviada con éxito a ' . $request->email]);
    }
}