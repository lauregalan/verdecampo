<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoAplicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'concentracion' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'string', 'in:GRANULADO,LIQUIDO'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del producto es requerido.',
            'concentracion.required' => 'La concentracion es requerida.',
            'tipo.required' => 'El tipo del producto es requerido.',
            'tipo.in' => 'El tipo del producto debe ser GRANULADO o LIQUIDO.',
        ];
    }
}
