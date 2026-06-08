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
        $query = Campania::where('campo_id', '=', $data['campo_id'])
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

        $lotesNuevos = array_map('intval', $data['lote_ids'] ?? []);
        sort($lotesNuevos);

        foreach ($posiblesDuplicados as $campania) {
            $lotesExistentes = $campania->lotes->pluck('id')->map(fn($id) => (int)$id)->toArray();
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
            } elseif (isset($data['fecha_inicio']) && Carbon::parse($data['fecha_inicio'])->isPast() && $fechaFin->isFuture()) {
                $data['estado'] = 'En Curso';
            }
        }

        $campania = Campania::create($data);

        if (isset($data['lote_ids'])) {
            $campania->lotes()->sync($data['lote_ids']);
        }

        return $campania;
    }

    public function update(Campania $campania, array $data)
    {
        // 1. Armamos el array de datos completo de forma segura (sin toArray() para evitar problemas de formato de fecha)
        $datosCompletos = [
            'campo_id' => $data['campo_id'] ?? $campania->campo_id,
            'cultivo_id' => array_key_exists('cultivo_id', $data) ? $data['cultivo_id'] : $campania->cultivo_id,
            'fecha_inicio' => $data['fecha_inicio'] ?? (is_string($campania->fecha_inicio) ? $campania->fecha_inicio : $campania->fecha_inicio->toDateString()),
            'fecha_fin' => $data['fecha_fin'] ?? (is_string($campania->fecha_fin) ? $campania->fecha_fin : $campania->fecha_fin->toDateString()),
            'lote_ids' => $data['lote_ids'] ?? $campania->lotes->pluck('id')->toArray(),
        ];

        // 2. Comprobamos el duplicado exacto
        $duplicadoExacto = $this->verificarDuplicadoExacto($datosCompletos, $campania->id);

        if ($duplicadoExacto) {
            throw ValidationException::withMessages([
                'nombre' => "Los cambios generan una campaña idéntica a '{$duplicadoExacto->nombre}'. No puedes duplicar contenido existente."
            ]);
        }

        // 3. Comprobamos conflictos de solapamiento
        $campaniaEnConflicto = $this->verificarConflictoCampanias(
            $datosCompletos['campo_id'],
            $datosCompletos['lote_ids'],
            $datosCompletos['fecha_inicio'],
            $datosCompletos['fecha_fin'],
            $campania->id
        );

        if ($campaniaEnConflicto) {
            throw ValidationException::withMessages([
                'lotes' => "Algunos de estos lotes ya están siendo utilizados en la campaña '{$campaniaEnConflicto->nombre}' durante esas fechas (desde {$campaniaEnConflicto->fecha_inicio} hasta {$campaniaEnConflicto->fecha_fin})."
            ]);
        }

        // 4. Lógica de estado inteligente con Carbon
        $fechaInicioStr = $data['fecha_inicio'] ?? $campania->fecha_inicio;
        $fechaFinStr = $data['fecha_fin'] ?? $campania->fecha_fin;

        if ($fechaInicioStr && $fechaFinStr) {
            $fechaInicio = Carbon::parse($fechaInicioStr);
            $fechaFin = Carbon::parse($fechaFinStr);

            if ($fechaFin->isPast()) {
                $data['estado'] = 'Finalizada';
            } elseif ($fechaInicio->isPast() && $fechaFin->isFuture()) {
                $data['estado'] = 'En Curso';
            }
        }

        if (isset($data['lote_ids'])) {
            $campania->lotes()->sync($data['lote_ids']);
        }

        $campania->update($data);

        return $campania;
    }

    public function destroy(Campania $campania): void
    {
        $campania->lotes()->detach();
        Campania::destroy($campania->getKey());
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

        return Campania::where('campo_id', '=', $campoId)
            ->when($campaniaIdExcluir, function ($query) use ($campaniaIdExcluir) {
                return $query->where('id', '!=', $campaniaIdExcluir);
            })
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                $query->where('fecha_inicio', '<=', $fechaFin)
                      ->where('fecha_fin', '>=', $fechaInicio);
            })
            ->whereHas('lotes', function ($query) use ($loteIds) {
                $query->whereIn('lote_id', $loteIds);
            })
            ->first();
    }
}
