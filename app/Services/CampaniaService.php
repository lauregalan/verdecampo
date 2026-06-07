<?php

namespace App\Services;

use App\Models\Campania;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;


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

    private function verificarDuplicadoExacto(array $data, $ignoreId = null)
{

    $query = Campania::where('campo_id', $data['campo_id'])
        ->where('fecha_inicio', $data['fecha_inicio'])
        ->where('fecha_fin', $data['fecha_fin']);


    if (empty($data['cultivo_id'])) {
        $query->whereNull('cultivo_id');
    } else {
        $query->where('cultivo_id', $data['cultivo_id']);
    }


    if ($ignoreId) {
        $query->where('id', '!=', $ignoreId);
    }

    $posiblesDuplicados = $query->get();


    $lotesNuevos = $data['lote_ids'] ?? [];
    sort($lotesNuevos);


    foreach ($posiblesDuplicados as $campania) {
        $lotesExistentes = $campania->lotes->pluck('id')->toArray();
        sort($lotesExistentes);

        if ($lotesNuevos === $lotesExistentes) {
            return $campania;
        }
    }

    return null;
}

    public function store(array $data)
    {
        $duplicadoExacto = $this->verificarDuplicadoExacto($data);

    if ($duplicadoExacto) {
        throw ValidationException::withMessages([
            'nombre' => "Ya existe una campaña idéntica registrada bajo el nombre '{$duplicadoExacto->nombre}'. No puedes registrar dos campañas con exactamente el mismo contenido."
        ]);
    }


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


        if (isset($data['fecha_fin'])) {
            $fechaFin = Carbon::parse($data['fecha_fin']);


            if ($fechaFin->isPast()) {
                $data['estado'] = 'Finalizada';
            }

            elseif (isset($data['fecha_inicio']) && Carbon::parse($data['fecha_inicio'])->isPast() && $fechaFin->isFuture()) {
                $data['estado'] = 'En Curso';
            }
        }

        $campania = Campania::create($data);

        if (isset($data['lote_ids'])) {
            $campania->lotes()->sync($data['lote_ids']);
        }

        return $campania;
    }

public function update(Campania $campania, array $data){

        $duplicadoExacto = $this->verificarDuplicadoExacto(
        array_merge($campania->toArray(), $data),
        $campania->id
        );

        if ($duplicadoExacto) {
            throw ValidationException::withMessages([
                'nombre' => "Los cambios generan una campaña idéntica a '{$duplicadoExacto->nombre}'. No puedes duplicar contenido existente."
            ]);
        }

        $campaniaEnConflicto = $this->verificarConflictoCampanias(
            $data['campo_id'] ?? $campania->campo_id,
            $data['lote_ids'] ?? $campania->lotes->pluck('id')->toArray(),
            $data['fecha_inicio'] ?? $campania->fecha_inicio,
            $data['fecha_fin'] ?? $campania->fecha_fin,
            $campania->id
        );

        if ($campaniaEnConflicto) {
            throw ValidationException::withMessages([
                'lotes' => "Algunos de estos lotes ya están siendo utilizados en la campaña '{$campaniaEnConflicto->nombre}' durante esas fechas (desde {$campaniaEnConflicto->fecha_inicio} hasta {$campaniaEnConflicto->fecha_fin})."
            ]);
        }

        $fechaInicioStr = $data['fecha_inicio'] ?? $campania->fecha_inicio;
        $fechaFinStr = $data['fecha_fin'] ?? $campania->fecha_fin;

        if ($fechaInicioStr && $fechaFinStr) {
            $fechaInicio = Carbon::parse($fechaInicioStr);
            $fechaFin = Carbon::parse($fechaFinStr);


            if ($fechaFin->isPast()) {
                $data['estado'] = 'Finalizada';
            }

            elseif ($fechaInicio->isPast() && $fechaFin->isFuture()) {
                $data['estado'] = 'En Curso';
            }
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
