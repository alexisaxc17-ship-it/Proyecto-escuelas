<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\School;
use App\Models\Alumno;

class ReporteController extends Controller
{
    public function reporteEscuelas()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $isAdmin = strtolower(trim($user->tipo)) === 'administrador';

        if ($isAdmin) {
            $escuelas = School::all();
        } else {
            $escuelas = School::where('id_user', $user->id_user)->get();
        }

        return response()->json($escuelas);
    }

    public function reporteAlumnos()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $isAdmin = strtolower(trim($user->tipo)) === 'administrador';

        if ($isAdmin) {
            $alumnos = Alumno::with([
                'school',
                'padres'
            ])->get();
        } else {
            $school = School::where('id_user', $user->id_user)->first();

            if (!$school) {
                return response()->json([]);
            }

            $alumnos = Alumno::with([
                'school',
                'padres'
            ])
            ->where('id_school', $school->id_school)
            ->get();
        }

        return response()->json($alumnos);
    }
}