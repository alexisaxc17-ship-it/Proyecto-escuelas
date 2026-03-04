<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PadreStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'alumnos' => 'nullable|array',
            'alumnos.*.id_alumno' => 'required|integer|exists:alumno,id_alumno',
            'alumnos.*.parentesco' => 'required|string|max:50',
        ];
    }
}