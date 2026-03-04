<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SchoolUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'    => 'sometimes|required|string|max:150',
            'direccion' => 'sometimes|required|string|max:255',
            'email'     => 'sometimes|nullable|string|max:150',

            'foto'      => 'sometimes|nullable',
            'foto_file' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'latitud'   => 'sometimes|nullable|numeric',
            'longitud'  => 'sometimes|nullable|numeric',
            'id_user'   => 'sometimes|nullable|integer',
        ];
    }
}