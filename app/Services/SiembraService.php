<?php

namespace App\Services;

use App\Models\Siembra;
class SiembraService
{
    public function getAll()
    {
        return Siembra::all();
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