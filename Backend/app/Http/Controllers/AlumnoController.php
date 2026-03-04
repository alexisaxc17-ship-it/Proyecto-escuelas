<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Http\Requests\AlumnoStoreRequest;
use App\Http\Requests\AlumnoUpdateRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AlumnoController extends Controller
{
    //Validar si es administrador
    private function esAdmin($user): bool
    {
        return strtolower(trim($user->tipo)) === 'administrador';
    }

    //Obtener escuela del usuario normal
    private function obtenerEscuelaUsuario($user)
    {
        return DB::table('school')
            ->where('id_user', $user->id_user)
            ->first();
    }

   
    // LISTAR
    public function index()
    {
        $user = Auth::user();

        if ($this->esAdmin($user)) {
            $alumnos = Alumno::with('padres', 'school')->get();
        } else {

            $school = $this->obtenerEscuelaUsuario($user);

            if (!$school) {
                return response()->json([]);
            }

            $alumnos = Alumno::with('padres', 'school')
                ->where('id_school', $school->id_school)
                ->get();
        }

        return response()->json($alumnos);
    }

 
    // MOSTRAR
    public function show($id)
    {
        $user = Auth::user();

        $alumno = Alumno::with('padres', 'school')
            ->where('id_alumno', $id)
            ->first();

        if (!$alumno) {
            return response()->json(['message' => 'Alumno no encontrado'], 404);
        }

        if (!$this->esAdmin($user)) {
            $school = $this->obtenerEscuelaUsuario($user);

            if (!$school || $alumno->id_school != $school->id_school) {
                return response()->json(['message' => 'Acceso denegado'], 403);
            }
        }

        return response()->json($alumno);
    }

    
    // CREAR
    public function store(AlumnoStoreRequest $request)
    {
        $user = Auth::user();
        $data = $request->validated();

        //Si es usuario normal, forzar su escuela
        if (!$this->esAdmin($user)) {
            $school = $this->obtenerEscuelaUsuario($user);

            if (!$school) {
                return response()->json(['message' => 'Usuario sin escuela asignada'], 403);
            }

            $data['id_school'] = $school->id_school;
        }

        //Manejo de foto
        if ($request->hasFile('foto_file')) {
            $data['foto'] = $request->file('foto_file')->store('alumnos', 'public');
        }

        $alumno = Alumno::create($data);

        //Sincronizar padres
        if ($request->has('padres')) {
            $syncData = [];
            foreach ($request->padres as $padre) {
                $syncData[$padre['id_padre']] = ['parentesco' => $padre['parentesco']];
            }
            $alumno->padres()->sync($syncData);
        }

        return response()->json([
            'message' => 'Alumno creado correctamente',
            'id_alumno' => $alumno->id_alumno
        ], 201);
    }

 
    // ACTUALIZAR
    public function update(AlumnoUpdateRequest $request, $id)
    {
        $user = Auth::user();

        $alumno = Alumno::where('id_alumno', $id)->first();

        if (!$alumno) {
            return response()->json(['message' => 'Alumno no encontrado'], 404);
        }

        //Validar permisos correctamente
        if (!$this->esAdmin($user)) {

            $school = $this->obtenerEscuelaUsuario($user);

            if (!$school || $alumno->id_school != $school->id_school) {
                return response()->json(['message' => 'Acceso denegado'], 403);
            }

            //Usuario normal NO puede cambiar de escuela
            $request->merge([
                'id_school' => $school->id_school
            ]);
        }

        $data = $request->validated();

        //Manejo de foto
        if ($request->hasFile('foto_file')) {

            if ($alumno->foto && str_starts_with($alumno->foto, 'alumnos/')) {
                Storage::disk('public')->delete($alumno->foto);
            }

            $data['foto'] = $request->file('foto_file')->store('alumnos', 'public');
        }

        $alumno->update($data);

        //Sincronizar padres
        if ($request->has('padres')) {
            $syncData = [];
            foreach ($request->padres as $padre) {
                $syncData[$padre['id_padre']] = ['parentesco' => $padre['parentesco']];
            }
            $alumno->padres()->sync($syncData);
        }

        return response()->json([
            'message' => 'Alumno actualizado correctamente'
        ]);
    }

    // ELIMINAR
    public function destroy($id)
    {
        $user = Auth::user();

        $alumno = Alumno::where('id_alumno', $id)->first();

        if (!$alumno) {
            return response()->json(['message' => 'Alumno no encontrado'], 404);
        }

        if (!$this->esAdmin($user)) {

            $school = $this->obtenerEscuelaUsuario($user);

            if (!$school || $alumno->id_school != $school->id_school) {
                return response()->json(['message' => 'Acceso denegado'], 403);
            }
        }

        //Borrar foto
        if ($alumno->foto && str_starts_with($alumno->foto, 'alumnos/')) {
            Storage::disk('public')->delete($alumno->foto);
        }

        $alumno->padres()->detach();
        $alumno->delete();

        return response()->json([
            'message' => 'Alumno eliminado correctamente'
        ]);
    }
}