<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CultivoRequest extends FormRequest
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
            'tipo' => ['required', 'string', 'max:255'],
            'variedad' => ['required', 'string', 'max:255'],
            'cultivo_antecesor_id' => ['nullable', 'integer', 'exists:cultivos,id'],
            'notas' => ['nullable', 'string'],
        ];
    }
}
