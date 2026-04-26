<?php

namespace App\Services;

use App\Models\Campania;

class CampaniaService
{

    public function index()
    {
        return Campania::all();
    }

    public function show(Campania $campania)
    {
        return $campania;
    }

    public function store(array $data)
    {
        $campania = Campania::create($data);
        
        if (isset($data['lote_ids'])) {
            $campania->lotes()->sync($data['lote_ids']);
        }
        
        return $campania;
    }

    public function update(Campania $campania, array $data)
    {
        $campania->update($data);
        
        if (isset($data['lote_ids'])) {
            $campania->lotes()->sync($data['lote_ids']);
        }
        
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
}
