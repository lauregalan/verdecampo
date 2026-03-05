<?php

namespace App\Http\Services;

use App\Models\Campo;

class CampoService
{
    public function index()
    {
        $campos = Campo::all();

        return $campos;
    }

    public function show(Campo $campo)
    {
        return $campo;
    }

    public function store(array $data)
    {
        $campo = Campo::create($data);

        return $campo;
    }

    public function update(Campo $campo, array $data)
    {
        $campo->update($data);

        return $campo;
    }

    public function destroy(Campo $campo)
    {
        $campo->delete();
    }
}
