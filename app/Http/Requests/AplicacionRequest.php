<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AplicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'producto_aplicacion_id' => ['required', 'integer', 'exists:productos_aplicaciones,id'],
            'tipo_aplicacion_id' => ['required', 'integer', 'exists:tipos_aplicaciones,id'],
            'campania_id' => ['required', 'integer', 'exists:campanias,id'],
            'lote_id' => [
                'required',
                'integer',
                'exists:lotes,id',
                Rule::exists('campania_lote', 'lote_id')->where(
                    fn ($query) => $query->where('campania_id', $this->input('campania_id'))
                ),
            ],
            'cantidad' => ['required', 'numeric', 'gt:0'],
            'unidad' => ['required', 'string', 'max:50'],
            'fecha' => ['required', 'date'],
            'precio_labor' => ['required', 'numeric', 'min:0'],
            'moneda_precio_labor' => ['required', 'string', 'max:10'],
            'observaciones' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'producto_aplicacion_id.required' => 'El producto de aplicacion es requerido.',
            'producto_aplicacion_id.exists' => 'El producto de aplicacion seleccionado no existe.',
            'tipo_aplicacion_id.required' => 'El tipo de aplicacion es requerido.',
            'tipo_aplicacion_id.exists' => 'El tipo de aplicacion seleccionado no existe.',
            'campania_id.required' => 'La campania es requerida.',
            'campania_id.exists' => 'La campania seleccionada no existe.',
            'lote_id.required' => 'El lote es requerido.',
            'lote_id.exists' => 'El lote seleccionado no existe o no pertenece a la campania.',
            'cantidad.required' => 'La cantidad es requerida.',
            'cantidad.gt' => 'La cantidad debe ser mayor a cero.',
            'unidad.required' => 'La unidad es requerida.',
            'fecha.required' => 'La fecha es requerida.',
            'fecha.date' => 'La fecha debe ser valida.',
            'precio_labor.required' => 'El precio de labor es requerido.',
            'moneda_precio_labor.required' => 'La moneda del precio de labor es requerida.',
        ];
    }
}
