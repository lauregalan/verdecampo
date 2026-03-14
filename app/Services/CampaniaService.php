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
        return Campania::create($data);
    }

    public function update(Campania $campania, array $data)
    {
        $campania->update($data);

        return $campania;
    }

    public function destroy(Campania $campania)
    {
        $campania->delete();
    }
}
