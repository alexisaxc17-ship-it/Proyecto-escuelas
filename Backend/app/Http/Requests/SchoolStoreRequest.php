<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SchoolStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'    => 'required|string|max:150',
            'direccion' => 'required|string|max:255',
            'email'     => 'nullable|string|max:150',

            // Foto: puede venir como archivo o como string
            'foto'      => 'nullable', 
            'foto_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'latitud'   => 'nullable|numeric',
            'longitud'  => 'nullable|numeric',
            'id_user'   => 'nullable|integer',
        ];
    }
}