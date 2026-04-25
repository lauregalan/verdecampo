<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SiembraRequest extends FormRequest
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
            //
            'campania_id' => ['required', 'exists:campanias,id'],
            'lote_id' => ['required', 'exists:lotes,id'],
            'cultivo_id' => ['required', 'exists:cultivos,id'],
            'fecha_siembra' => ['required', 'date'],
            'observaciones' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'campania_id.required' => 'La campaña es requerida',
            'campania_id.exists' => 'La campaña no existe',
            'lote_id.required' => 'El lote es requerido',
            'lote_id.exists' => 'El lote no existe',
            'cultivo_id.required' => 'El cultivo es requerido',
            'cultivo_id.exists' => 'El cultivo no existe',
            'fecha_siembra.required' => 'La fecha de siembra es requerida',
            'fecha_siembra.date' => 'La fecha de siembra debe ser una fecha válida',
        ];
    }
    
}
