<?php

namespace App\Services;

use App\Models\Siembra;
class SiembraService
{
/*private function formatSiembra(Siembra $siembra): array
{
    return [
        'id'                       => $siembra->id,
        'campania_id'              => $siembra->campania_id,
        'campania_nombre'          => $siembra->campania->nombre,
        'lote_id'                  => $siembra->lote_id,
        'lote_nombre'              => $siembra->lote->nombre,
        'cultivo_id'               => $siembra->cultivo_id,
        'cultivo_nombre'           => $siembra->cultivo->tipo . ' ' . $siembra->cultivo->variedad,
        'cultivo_antecesor_nombre' => null, // completar si tenés el dato
        'fecha'                    => $siembra->fecha_siembra, // clave unificada
        'observaciones'            => $siembra->observaciones,
    ];
}*/

/*public function getAll(): \Illuminate\Support\Collection
{
    return Siembra::with(['campania', 'lote', 'cultivo'])
        ->get()
        ->map(fn($s) => $this->formarSiembra($s));
}*/

    public function getAll()
    {
        return Siembra::with(['campania', 'lote', 'cultivo'])->get()->map(function($siembra) {
        return [
            'id' => $siembra->id,
            'campania_id' => $siembra->campania_id,
            'campania_nombre' => $siembra->campania->nombre,
            'lote_id' => $siembra->lote_id,
            'lote_nombre' => $siembra->lote->nombre,
            'cultivo_id' => $siembra->cultivo_id,
            'cultivo_nombre' => $siembra->cultivo->tipo . ' ' . $siembra->cultivo->variedad,
            'fecha_siembra' => $siembra->fecha_siembra,
            'observaciones' => $siembra->observaciones
        ];
    });
        //::all();
        //return Siembra::with(['campania', 'lote', 'cultivo'])
        //->orderByDesc('fecha_siembra')
        //->get();
    }

    public function getAllByCampania(int $id_campania)
    {
        return Siembra::with(['campania', 'lote', 'cultivo'])->where('campania_id', $id_campania)->get();
    }

    public function getById(int $id)
    {
        return Siembra::with(['campania', 'lote', 'cultivo'])->findOrFail($id);
    }

/*  public function create(array $data): array
{
    $siembra = Siembra::create($data);
    return $this->formatSiembra($siembra->load(['campania', 'lote', 'cultivo']));
}*/
/*public function update(int $id, array $data): array
{
    $siembra = Siembra::findOrFail($id);
    $siembra->update($data);
    return $this->formatSiembra($siembra->fresh()->load(['campania', 'lote', 'cultivo']));
}*/
    public function create(array $data): Siembra
    {
        return Siembra::create($data);
    }

    public function update(int $id, array $data)
    {
        $siembra = Siembra::findOrFail($id);
        $siembra->update($data);
        return $siembra->fresh();
    }

    public function delete(int $id)
    {
        $siembra = Siembra::findOrFail($id);
        $siembra->delete();

        return $siembra;
    }
}