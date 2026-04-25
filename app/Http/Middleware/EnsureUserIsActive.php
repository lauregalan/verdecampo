<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->active) {
            return $next($request);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Tu cuenta fue desactivada. Contacta a un productor para reactivarla.',
            ], 403);
        }

        return redirect()
            ->route('login')
            ->with('status', 'Tu cuenta fue desactivada. Contacta a un productor para reactivarla.');
    }
}
