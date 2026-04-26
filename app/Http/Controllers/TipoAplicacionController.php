<?php

namespace App\Http\Controllers;

use App\Http\Requests\TipoAplicacionRequest;
use App\Services\TipoAplicacionService;
use Illuminate\Http\JsonResponse;

class TipoAplicacionController extends Controller
{
    public function __construct(private TipoAplicacionService $tipoAplicacionService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->tipoAplicacionService->getAll());
    }

    public function store(TipoAplicacionRequest $request): JsonResponse
    {
        $tipoAplicacion = $this->tipoAplicacionService->create($request->validated());

        return response()->json($tipoAplicacion, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->tipoAplicacionService->getById($id));
    }

    public function update(TipoAplicacionRequest $request, int $id): JsonResponse
    {
        $tipoAplicacion = $this->tipoAplicacionService->update($id, $request->validated());

        return response()->json($tipoAplicacion);
    }

    public function destroy(int $id): JsonResponse
    {

        $this->tipoAplicacionService->delete($id);

        return response()->json(null, 204);
    }
}
