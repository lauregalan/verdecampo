<?php

namespace App\Services;

use App\Models\Aplicacion;
use Illuminate\Database\Eloquent\Collection;

class AplicacionService
{
    public function getAll(): Collection
    {
        return Aplicacion::with(['productoAplicacion', 'tipoAplicacion', 'campania', 'lote'])
            ->orderByDesc('fecha')
            ->get();
    }

    public function getById(int $id): Aplicacion
    {
        return Aplicacion::with(['productoAplicacion', 'tipoAplicacion', 'campania', 'lote'])
            ->findOrFail($id);
    }

    public function create(array $data): Aplicacion
    {
        $aplicacion = Aplicacion::create($data);

        return $aplicacion->load(['productoAplicacion', 'tipoAplicacion', 'campania', 'lote']);
    }

    public function update(int $id, array $data): Aplicacion
    {
        $aplicacion = Aplicacion::findOrFail($id);
        $aplicacion->update($data);

        return $aplicacion->fresh()->load(['productoAplicacion', 'tipoAplicacion', 'campania', 'lote']);
    }

    public function delete(int $id): void
    {
        Aplicacion::findOrFail($id)->delete();
    }
}
