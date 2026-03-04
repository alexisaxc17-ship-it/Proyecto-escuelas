<?php

namespace App\Http\Controllers;

use App\Http\Requests\SchoolStoreRequest;
use App\Http\Requests\SchoolUpdateRequest;
use App\Models\School;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SchoolController extends Controller
{
    private function esAdmin($user): bool
    {
        return strtolower($user->tipo) === strtolower('Administrador');
    }

    public function index()
    {
        $user = Auth::user();

        if ($this->esAdmin($user)) {
            return response()->json(School::query()->get());
        }

        return response()->json(
            School::query()->where('id_user', $user->id_user)->get()
        );
    }

    public function show($id)
    {
        $user = Auth::user();

        $school = School::query()->where('id_school', $id)->first();
        if (!$school) return response()->json(['message' => 'No encontrado'], 404);

        if ($this->esAdmin($user)) return response()->json($school);

        if ((int)$school->id_user !== (int)$user->id_user) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($school);
    }

    public function store(SchoolStoreRequest $request)
    {
        $user = Auth::user();
        if (!$this->esAdmin($user)) return response()->json(['message' => 'No autorizado'], 403);

        $data = $request->validated();

        // Si viene archivo, lo guardamos y ponemos la ruta en foto
        if ($request->hasFile('foto_file')) {
            $path = $request->file('foto_file')->store('schools', 'public'); // storage/app/public/schools/...
            $data['foto'] = $path; // guardamos "schools/xxxx.jpg"
        } else {
            //Si no viene archivo, respetamos foto string si viene
            $data['foto'] = $data['foto'] ?? null;
        }

        $school = School::query()->create($data);

        return response()->json([
            'message' => 'Escuela creada',
            'id_school' => $school->id_school,
        ], 201);
    }

    public function update(SchoolUpdateRequest $request, $id)
    {
        $user = Auth::user();
        if (!$this->esAdmin($user)) return response()->json(['message' => 'No autorizado'], 403);

        $school = School::query()->where('id_school', $id)->first();
        if (!$school) return response()->json(['message' => 'No encontrado'], 404);

        $data = $request->validated();

        //Si viene archivo nuevo, borramos el anterior (si era de storage) y guardamos el nuevo
        if ($request->hasFile('foto_file')) {
            if ($school->foto && str_starts_with($school->foto, 'schools/')) {
                Storage::disk('public')->delete($school->foto);
            }
            $path = $request->file('foto_file')->store('schools', 'public');
            $data['foto'] = $path;
        }

        $school->update($data);

        return response()->json(['message' => 'Escuela actualizada']);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        if (!$this->esAdmin($user)) return response()->json(['message' => 'No autorizado'], 403);

        $school = School::query()->where('id_school', $id)->first();
        if (!$school) return response()->json(['message' => 'No encontrado'], 404);

        //Borrar foto del storage si existe
        if ($school->foto && str_starts_with($school->foto, 'schools/')) {
            Storage::disk('public')->delete($school->foto);
        }

        $school->delete();

        return response()->json(['message' => 'Escuela eliminada']);
    }
}