<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CampoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string'],
            'latitud' => ['required', 'string'],
            'longitud' => ['required', 'string'],
            'hectareas' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del campo es requerido',
            'latitud.required' => 'La latitud es requerida',
            'longitud.required' => 'La longitud es requerida',
            'hectareas.required' => 'La superficie es requerida',
            'hectareas.numeric' => 'La superficie debe ser un número',
            'hectareas.min' => 'La superficie debe ser mayor a 0',
            'hectareas.max' => 'La superficie no puede exceder 999999.99 hectáreas',
        ];
    }
}
