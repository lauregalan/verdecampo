<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TipoAplicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del tipo de aplicacion es requerido.',
            'nombre.max' => 'El nombre del tipo de aplicacion no puede superar los 255 caracteres.',
        ];
    }
}
