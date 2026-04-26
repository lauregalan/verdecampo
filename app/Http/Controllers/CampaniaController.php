<?php

namespace App\Http\Controllers;

use App\Http\Requests\CampaniaRequest;
use App\Models\Campania;
use App\Services\CampaniaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaniaController extends Controller
{
    public function __construct(private CampaniaService $campaniaService) {}

    public function index(): JsonResponse
    {
        return response()->json($this->campaniaService->index());
    }

    public function store(CampaniaRequest $request): JsonResponse
    {
        $campania = $this->campaniaService->store($request->validated());

        return response()->json($campania, 201);
    }

    public function show(Campania $campania): JsonResponse
    {
        return response()->json($this->campaniaService->show($campania));
    }

    public function update(CampaniaRequest $request, Campania $campania): JsonResponse
    {
        $campania = $this->campaniaService->update($campania, $request->validated());

        return response()->json($campania);
    }

    public function destroy(Campania $campania): JsonResponse
    {

        $this->campaniaService->destroy($campania);

        return response()->json(null, 204);
    }

    public function getLotes(Campania $campania): JsonResponse
    {
        return response()->json($this->campaniaService->getLotes($campania));
    }

    public function asignarLotes(Request $request, Campania $campania): JsonResponse
    {

        $request->validate([
            'lote_ids' => ['required', 'array'],
            'lote_ids.*' => ['integer', 'exists:lotes,id'],
        ]);

        $this->campaniaService->asignarLotes($campania, $request->lote_ids);

        return response()->json(['message' => 'Lotes asignados correctamente']);
    }

    public function quitarLote(Campania $campania, int $loteId): JsonResponse
    {

        $this->campaniaService->quitarLote($campania, $loteId);

        return response()->json(['message' => 'Lote removido correctamente']);
    }


}

