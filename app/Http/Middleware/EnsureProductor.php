<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProductor
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->hasRole('Productor')) {
            abort(403, 'Solo los productores pueden realizar esta acción.');
        }

        return $next($request);
    }
}
