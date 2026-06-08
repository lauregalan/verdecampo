<?php

namespace App\Services;

use App\Models\Lote;

class LoteService
{
    public function getAllByCampo(int $id_campo)
    {
        return Lote::with(['campo', 'siembras.cultivo', 'siembras.campania', 'cosechas.campania'])->where('campo_id', $id_campo)->get();
    }

    public function getById(int $id)
    {
        return Lote::with(['siembras.cultivo', 'siembras.campania', 'cosechas.campania'])->find($id);
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
        $lote = Lote::findOrFail($id);
        $lote->update($data);

        return $lote;
    }

    public function delete(int $id)
    {
        $lote = Lote::findOrFail($id);
        $lote->delete();

        return $lote;
    }

    public function getByName(string $nombre)
    {
        return Lote::with(['siembras.cultivo', 'siembras.campania', 'cosechas.campania'])->where('nombre', 'like', '%'.$nombre.'%')->get();
    }

    public function getAll()
    {
        return Lote::with(['siembras.cultivo', 'siembras.campania', 'cosechas.campania'])->get();
    }
}
