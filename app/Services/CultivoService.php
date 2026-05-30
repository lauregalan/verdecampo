<?php

namespace App\Services;

use App\Models\Cultivo;
use App\Models\Campania;
use App\Models\Lote;

class CultivoService
{

    public function getAll()
    {
        return Cultivo::all();
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

    public function getByLote(int $loteId)
    {
        return Cultivo::whereHas('siembras', function ($query) use ($loteId) {
            $query->where('lote_id', $loteId);
        })->with(['siembras' => function ($query) use ($loteId) {
            $query->where('lote_id', $loteId)->orderBy('fecha_siembra', 'desc');
        }])->get();
    }
}
