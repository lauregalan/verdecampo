<?php

namespace App\Services;

use App\Models\Lote;

class LoteService
{
    public function getAllByCampo(int $id_campo)
    {
        return Lote::with('campo')->where('id_campo', $id_campo)->get();
    }

    public function getById(int $id)
    {
        return Lote::find($id);
    }

    public function getAllByCampania(int $id_campania)
    {
        return Lote::whereHas('campanias', function ($query) use ($id_campania) {
            $query->where('campanias.id', $id_campania);
        })->get();
    }

    public function create(array $data)
    {
        return Lote::create($data);   
    }

    public function update(int $id, array $data)
    {
        $lote = Lote::find($id);
        $lote->update($data);
        return $lote;
    }

    public function delete(int $id)
    {
        $lote = Lote::find($id);
        $lote->delete();
        return $lote;
    }

    public function getByName(string $nombre)
    {
        return Lote::where('nombre','like', '%'.$nombre.'%')->get();
    }
}
