<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\School;
use App\Models\Alumno;

class DashboardController extends Controller
{
    /*
     * Devuelve JSON con:
     *  - schools: array de escuelas (latitud/longitud casteadas a float)
     *  - alumnos: array de alumnos (latitud/longitud casteadas a float)
     *
     * Si el usuario es Administrador devuelve todas las escuelas + todos los alumnos.
     * Si es Usuario devuelve solo su escuela y los alumnos de esa escuela y padres.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $isAdmin = strtolower(trim($user->tipo)) === 'administrador';

        if ($isAdmin) {
            $schools = School::all()->map(function ($s) {
                $arr = $s->toArray();
                $arr['latitud'] = $arr['latitud'] !== null ? (float) $arr['latitud'] : null;
                $arr['longitud'] = $arr['longitud'] !== null ? (float) $arr['longitud'] : null;
                return $arr;
            });

            $alumnos = Alumno::all()->map(function ($a) {
                $arr = $a->toArray();
                $arr['latitud'] = $arr['latitud'] !== null ? (float) $arr['latitud'] : null;
                $arr['longitud'] = $arr['longitud'] !== null ? (float) $arr['longitud'] : null;
                return $arr;
            });

            return response()->json([
                'schools' => $schools,
                'alumnos' => $alumnos,
            ]);
        }

        // Usuario normal -> buscar su escuela por id_user
        $school = School::where('id_user', $user->id_user)->first();

        if (!$school) {
            return response()->json([
                'schools' => [],
                'alumnos' => []
            ]);
        }

        $schoolArr = $school->toArray();
        $schoolArr['latitud'] = $schoolArr['latitud'] !== null ? (float) $schoolArr['latitud'] : null;
        $schoolArr['longitud'] = $schoolArr['longitud'] !== null ? (float) $schoolArr['longitud'] : null;

        $alumnos = Alumno::where('id_school', $school->id_school)->get()->map(function ($a) {
            $arr = $a->toArray();
            $arr['latitud'] = $arr['latitud'] !== null ? (float) $arr['latitud'] : null;
            $arr['longitud'] = $arr['longitud'] !== null ? (float) $arr['longitud'] : null;
            return $arr;
        });

        return response()->json([
            'schools' => [$schoolArr],
            'alumnos' => $alumnos,
        ]);
    }
}