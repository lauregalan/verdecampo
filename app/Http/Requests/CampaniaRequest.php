<?php

namespace App\Http\Requests;

use App\Models\Lote;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
            'lote_ids'           => ['required', 'array', 'min:1'],
            'lote_ids.*'         => ['integer', 'distinct', 'exists:lotes,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $campoId = $this->integer('campo_id');
            $loteIds = $this->input('lote_ids', []);

            if ($campoId <= 0 || ! is_array($loteIds) || count($loteIds) === 0) {
                return;
            }

            $loteIds = array_values(array_unique(array_map('intval', $loteIds)));

            $campoTieneLotes = Lote::query()
                ->where('campo_id', $campoId)
                ->exists();

            if (! $campoTieneLotes) {
                $validator->errors()->add(
                    'lote_ids',
                    'No se pueden registrar campanias en un campo sin lotes asociados.'
                );

                return;
            }

            $lotesDelCampo = Lote::query()
                ->where('campo_id', $campoId)
                ->whereIn('id', $loteIds)
                ->count();

            if ($lotesDelCampo !== count($loteIds)) {
                $validator->errors()->add(
                    'lote_ids',
                    'Todos los lotes seleccionados deben pertenecer al campo de la campania.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'lote_ids.required' => 'No se pueden registrar campanias sin lotes asociados.',
            'lote_ids.min' => 'No se pueden registrar campanias sin lotes asociados.',
        ];
    }
}
