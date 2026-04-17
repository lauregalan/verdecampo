<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LoteRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:50'],
            'caracteristicas' => ['required', 'string'],
            'estado' => ['required', 'string', 'in:produccion,barbecho,preparacion,disponible'],
            'longitud' => ['required', 'numeric'],
            'latitud' => ['required', 'numeric'],
            'hectareas' => ['required', 'numeric', 'min:0'],
            'ph' => ['nullable', 'numeric', 'between:0,14'],
            'napa' => ['nullable', 'numeric', 'min:0'],
            'campo_id' => ['required', 'exists:campos,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es requerido',
            'caracteristicas.required' => 'Las caracteristicas son requeridas',
            'estado.required' => 'El estado es requerido',
            'longitud.required' => 'La longitud es requerida',
            'latitud.required' => 'La latitud es requerida',
            'hectareas.required' => 'Las hectareas son requeridas',
            'ph.nullable' => 'El ph es requerido',
            'napa.nullable' => 'La napa es requerida',
            'campo_id.required' => 'El campo es requerido',
        ];
    }
}
