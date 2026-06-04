<?php

namespace App\Http\Controllers;

use App\Exports\LotesExport;
use App\Http\Requests\LoteRequest;
use App\Services\LoteService;
use App\Services\SimpleExcelExportService;
use Illuminate\Http\JsonResponse;

class LoteController extends Controller
{
    public function __construct(
        private LoteService $loteService,
        private SimpleExcelExportService $simpleExcelExportService,
    ) {}

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

    public function showAll(): JsonResponse
    {
        $lotes = $this->loteService->getAll();

        return response()->json($lotes, 200);
    }

    /**
     * Exportar lotes a Excel
     */
    public function exportToExcel()
    {
        return $this->simpleExcelExportService->download(new LotesExport, 'lotes_'.date('Y-m-d_H-i-s').'.xlsx');
    }
}
