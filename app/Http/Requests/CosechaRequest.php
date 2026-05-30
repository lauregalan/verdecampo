<?php

namespace App\Http\Requests;

use App\Models\Campania;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $campaniaId = $this->integer('campania_id');
            $fechaInput = $this->input('fecha');

            if ($campaniaId <= 0 || ! is_string($fechaInput) || $fechaInput === '') {
                return;
            }

            try {
                $fechaCosecha = Carbon::parse($fechaInput)->startOfDay();
            } catch (\Throwable) {
                return;
            }

            $campania = Campania::find($campaniaId);

            if (! $campania?->fecha_inicio) {
                return;
            }

            if ($fechaCosecha->lt(Carbon::parse($campania->fecha_inicio)->startOfDay())) {
                $validator->errors()->add(
                    'fecha',
                    'La fecha de cosecha no puede ser anterior al inicio de la campania.'
                );
            }
        });
    }
}
