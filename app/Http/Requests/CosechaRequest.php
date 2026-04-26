<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CosechaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'campania_id'   => ['required', 'integer', 'exists:campanias,id'],
            'lote_id'       => ['required', 'integer', 'exists:lotes,id'],
            'fecha'         => ['nullable', 'date'],
            'rinde'         => ['required', 'numeric', 'min:0'],
            'humedad'       => ['required', 'numeric', 'min:0', 'max:100'],
            'observaciones' => ['nullable', 'string'],
        ];
    }
}
