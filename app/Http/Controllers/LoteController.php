<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LoteService;
use App\Models\Lote;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\LoteRequest;
use App\Http\Requuests\StoreLoteRequest;

class LoteController extends Controller
{
    public function __construct(private LoteService $loteService){}

    public function indexByCampo(int $id_campo): JsonResponse
    {
        $lotes = $this->loteService->getAllByCampo($id_campo);
        return response()->json($lotes, 200);
    }

    public function show(int $id): JsonResponse
    {
        $lote = $this->loteService->getById($id);
        return response()->json($lote, 200);
    }

    public function store(LoteRequest $request): JsonResponse
    {
        $lote = $this->loteService->create($request->validated());
        return response()->json($lote, 201);
    }

    public function update(LoteRequest $request, int $id): JsonResponse
    {
        $lote = $this->loteService->update($id, $request->validated());
        return response()->json($lote, 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $lote = $this->loteService->delete($id);
        return response()->json($lote, 200);
    }

    public function indexByName(string $nombre): JsonResponse
    {
        $lotes = $this->loteService->getByName($nombre);
        return response()->json($lotes, 200);
    }

    public function indexByCampania(int $id_campania): JsonResponse
    {
        $lotes = $this->loteService->getAllByCampania($id_campania);
        return response()->json($lotes, 200);
    }

}
