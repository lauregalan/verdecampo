<?php

namespace App\Services;

use App\Models\ProductoAplicacion;
use Illuminate\Database\Eloquent\Collection;

class ProductoAplicacionService
{
    public function getAll(): Collection
    {
        return ProductoAplicacion::orderBy('nombre')->get();
    }

    public function getById(int $id): ProductoAplicacion
    {
        return ProductoAplicacion::findOrFail($id);
    }

    public function create(array $data): ProductoAplicacion
    {
        return ProductoAplicacion::create($data);
    }

    public function update(int $id, array $data): ProductoAplicacion
    {
        $productoAplicacion = ProductoAplicacion::findOrFail($id);
        $productoAplicacion->update($data);

        return $productoAplicacion->fresh();
    }

    public function delete(int $id): void
    {
        ProductoAplicacion::findOrFail($id)->delete();
    }
}
