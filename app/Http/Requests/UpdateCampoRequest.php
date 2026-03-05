<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCampoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'    => ['sometimes', 'string'],
            'latitud'   => ['sometimes', 'string'],
            'longitud'  => ['sometimes', 'string'],
            'hectareas' => ['sometimes', 'integer'],
        ];
    }
}
