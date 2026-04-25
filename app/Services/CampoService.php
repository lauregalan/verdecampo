<?php

namespace App\Services;

use App\Models\Campo;

class CampoService
{
    public function index()
    {
        $campos = Campo::with(['campanias' => function($query) {
            $query->where('estado', 'En Curso')->with('cultivo');
        }])->get();

        return $campos->map(function($campo) {
            $campaniaEnCurso = $campo->campanias->first();
            $cultivo = $campaniaEnCurso ? $campaniaEnCurso->cultivo : null;
            $campo->cultivo_actual = $cultivo ? $cultivo->tipo : 'Sin siembras';
            return $campo;
        });
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
