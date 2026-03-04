<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Padre;
use App\Models\Alumno;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PadreController extends Controller
{
    // Listar padres
    public function index()
    {
        $user = Auth::user();

        if (strtolower(trim($user->tipo)) === 'administrador') {
            $padres = Padre::with('alumnos')->get();
        } else {
            $school = DB::table('school')->where('id_user', $user->id_user)->first();

            $padres = Padre::whereHas('alumnos', function($q) use ($school) {
                $q->where('id_school', $school->id_school);
            })->with(['alumnos' => function($q) use ($school) {
                $q->where('id_school', $school->id_school);
            }])->get();
        }

        return response()->json($padres, 200);
    }

    // Mostrar padre
    public function show($id)
    {
        $user = Auth::user();
        $padre = Padre::find($id);

        if (!$padre) {
            return response()->json(['message' => 'Padre no encontrado'], 404);
        }

        if (strtolower(trim($user->tipo)) !== 'administrador') {
            $school = DB::table('school')->where('id_user', $user->id_user)->first();
            $padre->load(['alumnos' => function($q) use ($school) {
                $q->where('id_school', $school->id_school);
            }]);
        } else {
            $padre->load('alumnos');
        }

        return response()->json($padre, 200);
    }

    // Crear padre
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $padre = Padre::create($request->only(['nombre', 'direccion', 'telefono']));

            if ($request->has('alumnos')) {
                foreach ($request->alumnos as $alumno) {
                    $al = Alumno::find($alumno['id_alumno']);
                    if ($al) {
                        $padre->alumnos()->attach($alumno['id_alumno'], ['parentesco' => $alumno['parentesco']]);
                    }
                }
            }

            DB::commit();
            return response()->json($padre->load('alumnos'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear padre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar padre
    public function update(Request $request, $id)
    {
        $padre = Padre::find($id);

        if (!$padre) {
            return response()->json(['message' => 'Padre no encontrado'], 404);
        }

        DB::beginTransaction();
        try {
            $padre->update($request->only(['nombre', 'direccion', 'telefono']));

            if ($request->has('alumnos')) {
                $syncData = [];
                foreach ($request->alumnos as $alumno) {
                    $al = Alumno::find($alumno['id_alumno']);
                    if ($al) {
                        $syncData[$alumno['id_alumno']] = ['parentesco' => $alumno['parentesco'] ?? 'Padre'];
                    }
                }
                $padre->alumnos()->sync($syncData);
            } else {
                $padre->alumnos()->detach();
            }

            DB::commit();
            return response()->json($padre->load('alumnos'), 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar padre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar padre
    public function destroy($id)
    {
        $padre = Padre::find($id);
        if (!$padre) {
            return response()->json(['message' => 'Padre no encontrado'], 404);
        }

        DB::beginTransaction();
        try {
            $padre->alumnos()->detach();
            $padre->delete();
            DB::commit();

            return response()->json(['message' => 'Padre eliminado correctamente'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar padre',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}