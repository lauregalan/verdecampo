<?php

namespace App\Services;

use App\Models\Cultivo;
use App\Models\Lote;

class CultivoService
{
    public function getByCampania(int $campaniaId)
    {
        return Cultivo::where('campania_id', $campaniaId)->get();
    }

    public function getByLote(int $loteId)
    {
        return Cultivo::where('lote_id', $loteId)->get();
    }

    public function show(Cultivo $cultivo)
    {
        return $cultivo;
    }

    public function store(array $data)
    {
        return Cultivo::create($data);
    }

    public function update(Cultivo $cultivo, array $data)
    {
        $cultivo->update($data);

        return $cultivo;
    }

    public function destroy(Cultivo $cultivo)
    {
        $cultivo->delete();
    }
}
