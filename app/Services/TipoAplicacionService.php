<?php

namespace App\Services;

use App\Models\TipoAplicacion;
use Illuminate\Database\Eloquent\Collection;

class TipoAplicacionService
{
    public function getAll(): Collection
    {
        return TipoAplicacion::orderBy('nombre')->get();
    }

    public function getById(int $id): TipoAplicacion
    {
        return TipoAplicacion::findOrFail($id);
    }

    public function create(array $data): TipoAplicacion
    {
        return TipoAplicacion::create($data);
    }

    public function update(int $id, array $data): TipoAplicacion
    {
        $tipoAplicacion = TipoAplicacion::findOrFail($id);
        $tipoAplicacion->update($data);

        return $tipoAplicacion->fresh();
    }

    public function delete(int $id): void
    {
        TipoAplicacion::findOrFail($id)->delete();
    }
}
