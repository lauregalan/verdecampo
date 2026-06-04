<?php

namespace App\Http\Controllers;

use App\Exports\CultivosExport;
use App\Http\Requests\CultivoRequest;
use App\Models\Cultivo;
use App\Services\CultivoService;
use App\Services\SimpleExcelExportService;
use Illuminate\Http\JsonResponse;

class CultivoController extends Controller
{
    public function __construct(
        private CultivoService $cultivoService,
        private SimpleExcelExportService $simpleExcelExportService,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->cultivoService->getAll());
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

    /**
     * Exportar cultivos a Excel
     */
    public function exportToExcel()
    {
        return $this->simpleExcelExportService->download(new CultivosExport, 'cultivos_'.date('Y-m-d_H-i-s').'.xlsx');
    }
}
