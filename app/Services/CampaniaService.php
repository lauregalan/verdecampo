<?php

namespace App\Services;

use App\Models\Campania;
use Illuminate\Validation\ValidationException;

class CampaniaService
{

    public function index()
    {
        return Campania::with(['cultivo', 'lotes'])->get();
    }

    public function show(Campania $campania)
    {
        return $campania->load(['cultivo', 'lotes']);
    }

    public function store(array $data)
    {
        $campaniaEnConflicto = $this->verificarConflictoCampanias(
            $data['campo_id'] ?? null,
            $data['lote_ids'] ?? [],
            $data['fecha_inicio'] ?? null,
            $data['fecha_fin'] ?? null
        );

        if ($campaniaEnConflicto) {
            throw ValidationException::withMessages([
                'lotes' => "Algunos de estos lotes ya están siendo utilizados en la campaña '{$campaniaEnConflicto->nombre}' durante esas fechas (desde {$campaniaEnConflicto->fecha_inicio} hasta {$campaniaEnConflicto->fecha_fin})."
            ]);
        }

        $campania = Campania::create($data);

        if (isset($data['lote_ids'])) {
            $campania->lotes()->sync($data['lote_ids']);
        }

        return $campania;
    }

    public function update(Campania $campania, array $data)
    {
        $campaniaEnConflicto = $this->verificarConflictoCampanias(
            $data['campo_id'] ?? $campania->campo_id,
            $data['lote_ids'] ?? $campania->lotes->pluck('id')->toArray(),
            $data['fecha_inicio'] ?? $campania->fecha_inicio,
            $data['fecha_fin'] ?? $campania->fecha_fin,
            $campania->id
        );

        if ($campaniaEnConflicto) {
            throw ValidationException::withMessages([
            ]);
        }

        if (isset($data['lote_ids'])) {
            $campania->lotes()->sync($data['lote_ids']);
        }

        $campania->update($data);

        return $campania;
    }

    public function destroy(Campania $campania)
    {
        $campania->delete();
    }

    public function getLotes(Campania $campania)
    {
        return $campania->lotes;
    }

    public function asignarLotes(Campania $campania, array $loteIds): void
    {
        $campania->lotes()->syncWithoutDetaching($loteIds);
    }

    public function quitarLote(Campania $campania, int $loteId): void
    {
        $campania->lotes()->detach($loteId);
    }

    /**
     * Verifica si hay conflictos con otras campañas en el mismo campo y lotes.
     * Retorna la campaña en conflicto si la hay, null si no hay conflictos.
     *
     * @param int|null $campoId ID del campo
     * @param array $loteIds IDs de los lotes
     * @param string|null $fechaInicio Fecha de inicio de la campaña
     * @param string|null $fechaFin Fecha de fin de la campaña
     * @param int|null $campaniaIdExcluir ID de la campaña a excluir de la búsqueda (útil para updates)
     * @return Campania|null
     */
    private function verificarConflictoCampanias(
        ?int $campoId,
        array $loteIds,
        ?string $fechaInicio,
        ?string $fechaFin,
        ?int $campaniaIdExcluir = null
    ): ?Campania {
        if (!$campoId || empty($loteIds) || !$fechaInicio || !$fechaFin) {
            return null;
        }

        return Campania::where('campo_id', $campoId)
            ->when($campaniaIdExcluir, function ($query) use ($campaniaIdExcluir) {
                // Excluir la campaña actual si se proporciona
                return $query->where('id', '!=', $campaniaIdExcluir);
            })
            // Verificar sobreposición de fechas:
            // Dos rangos de fechas se superponen si:
            // fecha_inicio <= fecha_fin_nueva AND fecha_fin >= fecha_inicio_nueva
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                $query->where('fecha_inicio', '<=', $fechaFin)
                      ->where('fecha_fin', '>=', $fechaInicio);
            })
            // Verificar que al menos uno de los lotes esté siendo usado
            ->whereHas('lotes', function ($query) use ($loteIds) {
                $query->whereIn('lote_id', $loteIds);
            })
            ->first();
    }
}
