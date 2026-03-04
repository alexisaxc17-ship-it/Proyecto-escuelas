<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    private function esAdmin($user): bool
    {
        // En mi  BD es "Administrador" / "Usuario"
        return strtolower(trim($user->tipo)) === 'administrador';
    }

    //Login solo valida credenciales 
    public function login(Request $request)
    {
        $data = $request->validate([
            'usuario' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = DB::table('usuarios')->where('usuario', $data['usuario'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        return response()->json([
            'message' => 'Login OK',
            'user' => [
                'id_user' => $user->id_user,
                'nombre' => $user->nombre,
                'usuario' => $user->usuario,
                'tipo' => $user->tipo,
            ],
        ]);
    }

    //Me funciona con BasicAuth (Postman Auth tab)
    public function me()
    {
        $user = Auth::user(); // viene de auth.basic

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $school = null;

        //Si es Usuario (NO admin) traer su escuela por school.id_user
        if (!$this->esAdmin($user)) {
            $school = DB::table('school')
                ->where('id_user', $user->id_user)
                ->first();
        }

        return response()->json([
            'user' => [
                'id_user' => $user->id_user,
                'nombre' => $user->nombre,
                'usuario' => $user->usuario,
                'tipo' => $user->tipo,
            ],
            'school' => $school,
        ]);
    }

    //BasicAuth no guarda sesión, es solo “respuesta bonita”
    public function logout()
    {
        return response()->json(['message' => 'Logout OK (BasicAuth no guarda sesión)']);
    }
}