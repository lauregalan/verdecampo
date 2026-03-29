<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CampaniaRequest extends FormRequest
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
            'campo_id'           => ['required', 'integer', 'exists:campos,id'],
            'cultivo_id'         => ['nullable', 'integer', 'exists:cultivos,id'],
            'nombre'             => ['required', 'string', 'max:255'],
            'fecha_inicio'       => ['required', 'date'],
            'fecha_fin'          => ['nullable', 'date', 'after:fecha_inicio'],
            'estado'             => ['required', 'string', 'in:Planificada,En Curso,Finalizada,Cancelada'],
        ];
    }
}
