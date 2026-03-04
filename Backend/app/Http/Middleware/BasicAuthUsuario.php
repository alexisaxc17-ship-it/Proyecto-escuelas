<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BasicAuthUsuario
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::onceBasic('usuario')) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        return $next($request);
    }
}