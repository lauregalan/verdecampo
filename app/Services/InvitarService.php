<?php
namespace App\Services;

use App\Models\User;
use App\Mail\InvitacionColaborador;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class InvitarService    
{
    /* logica */
    public function generarYEnviar(string $email): User
    {
        //Generación de la URL firmada
        $url = URL::temporarySignedRoute(
            'invitation.accept',
            now()->addDays(2),
            ['email' => $email]
        );

        //Registrar al usuario si aún no existe
        $usuario = User::firstOrCreate(
            ['email' => $email],
            [
                'name'     => ucfirst(explode('@', $email)[0]),
                'password' => Hash::make(str()->random(32)),
                'email_verified_at' => null,
            ]
        );

        //Enviar el email
        Mail::to($email)->send(new InvitacionColaborador($url));
        
        Log::info('Invitación enviada correctamente', [
            'email_destino' => $email,
            'id_usuario_creado' => $usuario->id,
        ]);

        return $usuario; 
    }
}