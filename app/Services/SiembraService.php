<?php

namespace App\Services;

use App\Models\Siembra;

class SiembraService
{
    private function formatSiembra(Siembra $siembra): array
    {
        $antecesor = $siembra->ultimo_cultivo;

        return [
            'id' => $siembra->id,
            'campania_id' => $siembra->campania_id,
            'campania_nombre' => $siembra->campania->nombre,
            'lote_id' => $siembra->lote_id,
            'lote_nombre' => $siembra->lote->nombre,
            'cultivo_id' => $siembra->cultivo_id,
            'cultivo_nombre' => $siembra->cultivo->tipo.' '.$siembra->cultivo->variedad,
            'cultivo_antecesor_nombre' => $antecesor
                ? $antecesor->tipo.' '.$antecesor->variedad
                : null,
            'fecha_siembra' => $siembra->fecha_siembra,
            'observaciones' => $siembra->observaciones,
        ];
    }

    public function getAll()
    {
        return Siembra::with(['campania', 'lote', 'cultivo'])
            ->orderByDesc('fecha')
            ->get()
            ->map(fn ($siembra) => $this->formatSiembra($siembra));
    }

    public function getAllByCampania(int $id_campania)
    {
        return Siembra::with(['campania', 'lote', 'cultivo'])
            ->where('campania_id', $id_campania)
            ->get()
            ->map(fn ($siembra) => $this->formatSiembra($siembra));
    }

    public function getById(int $id)
    {
        $siembra = Siembra::with(['campania', 'lote', 'cultivo'])->findOrFail($id);

        return $this->formatSiembra($siembra);
    }

    public function create(array $data): array
    {
        $siembra = Siembra::create($data);
        $siembra->load(['campania', 'lote', 'cultivo']);

        return $this->formatSiembra($siembra);
    }

    public function update(int $id, array $data): array
    {
        $siembra = Siembra::findOrFail($id);
        $siembra->update($data);
        $siembra = $siembra->fresh(['campania', 'lote', 'cultivo']); // ← bug corregido

        return $this->formatSiembra($siembra);
    }

    public function delete(int $id): array
    {
        $siembra = Siembra::findOrFail($id);
        $formatted = $this->formatSiembra($siembra->load(['campania', 'lote', 'cultivo']));
        $siembra->delete();

        return $formatted;
    }
}
