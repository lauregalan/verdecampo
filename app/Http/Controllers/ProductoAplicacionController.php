<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductoAplicacionRequest;
use App\Services\ProductoAplicacionService;
use Illuminate\Http\JsonResponse;

class ProductoAplicacionController extends Controller
{
    public function __construct(private ProductoAplicacionService $productoAplicacionService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->productoAplicacionService->getAll());
    }

    public function store(ProductoAplicacionRequest $request): JsonResponse
    {
        $productoAplicacion = $this->productoAplicacionService->create($request->validated());

        return response()->json($productoAplicacion, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->productoAplicacionService->getById($id));
    }

    public function update(ProductoAplicacionRequest $request, int $id): JsonResponse
    {
        $productoAplicacion = $this->productoAplicacionService->update($id, $request->validated());

        return response()->json($productoAplicacion);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->productoAplicacionService->delete($id);

        return response()->json(null, 204);
    }
}
