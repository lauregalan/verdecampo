<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Models\Lote;

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
            'hectareas' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'ph' => ['nullable', 'numeric', 'between:0,14'],
            'napa' => ['nullable', 'numeric', 'min:0'],
            'campo_id' => ['required', 'exists:campos,id'],
            'polygon' => ['nullable', 'array'],
            'polygon.*.lat' => ['required_with:polygon', 'numeric'],
            'polygon.*.lng' => ['required_with:polygon', 'numeric'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es requerido',
            'caracteristicas.required' => 'Las caracteristicas son requeridas',
            'estado.required' => 'El estado es requerido',
            'estado.in' => 'El estado seleccionado no es valido',
            'longitud.required' => 'La longitud es requerida',
            'latitud.required' => 'La latitud es requerida',
            'hectareas.required' => 'Las hectareas son requeridas',
            'hectareas.min' => 'Las hectareas deben ser mayores a 0',
            'hectareas.max' => 'Las hectareas no pueden exceder 999999.99',
            'ph.numeric' => 'El ph debe ser numerico',
            'ph.between' => 'El ph debe estar entre 0 y 14',
            'napa.numeric' => 'La napa debe ser numerica',
            'napa.min' => 'La napa no puede ser negativa',
            'campo_id.required' => 'El campo es requerido',
            'campo_id.exists' => 'El campo seleccionado no existe',
            'polygon.array' => 'El poligono debe tener un formato valido',
            'polygon.*.lat.numeric' => 'La latitud del poligono debe ser numerica',
            'polygon.*.lng.numeric' => 'La longitud del poligono debe ser numerica',
        ];
    }

    protected function passedValidation(): void
    {
        // Validate that the sum of lots does not exceed the field surface
        $campoId = $this->input('campo_id');
        $hectareas = (float) $this->input('hectareas');
        
        // Get the field to check its total surface
        $campo = \App\Models\Campo::find($campoId);
        if (!$campo) {
            return;
        }

        // Calculate the sum of existing lots (excluding the current one if updating)
        $query = Lote::where('campo_id', $campoId);
        
        // If this is an update, exclude the current lot
        if ($this->getMethod() === 'PUT' && $this->route('id')) {
            $query->where('id', '!=', $this->route('id'));
        }
        
        $sumOtherLotes = $query->sum('hectareas');
        $totalWithNewLote = $sumOtherLotes + $hectareas;

        if ($totalWithNewLote > $campo->hectareas) {
            $this->validator->errors()->add(
                'hectareas',
                "La suma de lotes ({$totalWithNewLote} ha) no puede exceder la superficie del campo ({$campo->hectareas} ha)."
            );
        }
    }
}
