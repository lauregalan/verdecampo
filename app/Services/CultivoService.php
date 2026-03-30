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
}
