<?php

namespace App\Http\Controllers;

use App\Http\Requests\CultivoRequest;
use App\Models\Cultivo;
use App\Services\CultivoService;
use Illuminate\Http\JsonResponse;

class CultivoController extends Controller
{
    public function __construct(private CultivoService $cultivoService) {}

    public function getByCampania(int $campaniaId): JsonResponse
    {
        return response()->json($this->cultivoService->getByCampania($campaniaId));
    }

    public function getByLote(int $loteId): JsonResponse
    {
        return response()->json($this->cultivoService->getByLote($loteId));
    }

    public function index(): JsonResponse
    {
        $cultivos = $this->cultivoService->index();

        return response()->json($cultivos);
    }

    public function show(Cultivo $cultivo): JsonResponse
    {
        return response()->json($this->cultivoService->show($cultivo));
    }

    public function store(CultivoRequest $request): JsonResponse
    {
        $cultivo = $this->cultivoService->store($request->validated());

        return response()->json($cultivo, 201);
    }

    public function update(CultivoRequest $request, Cultivo $cultivo): JsonResponse
    {
        $cultivo = $this->cultivoService->update($cultivo, $request->validated());

        return response()->json($cultivo);
    }

    public function destroy(Cultivo $cultivo): JsonResponse
    {
        $this->cultivoService->destroy($cultivo);

        return response()->json(null, 204);
    }
}
