<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class AlumnoUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nombre_completo' => 'sometimes|required|string|max:180',
            'direccion'       => 'nullable|string|max:255',
            'telefono'        => 'nullable|string|max:30',
            'email'           => 'nullable|email|max:150',
            'foto'            => 'nullable|string|max:255',
            'genero' => 'nullable|in:masculino,femenino',
            'latitud'         => 'nullable|numeric',
            'longitud'        => 'nullable|numeric',
            'id_grado'        => 'nullable|integer',
            'id_seccion'      => 'nullable|integer',

            'padres'                  => 'nullable|array',
            'padres.*.id_padre'       => 'required_with:padres|exists:padres,id_padre',
            'padres.*.parentesco'     => 'required_with:padres|string|max:50'
        ];

        $user = Auth::user();

        if ($user && strtolower($user->tipo) === 'administrador') {
            $rules['id_school'] = 'sometimes|required|integer|exists:school,id_school';
        }

        return $rules;
    }
}