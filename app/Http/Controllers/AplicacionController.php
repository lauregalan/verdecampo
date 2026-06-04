<?php

namespace App\Http\Controllers;

use App\Exports\AplicacionesExport;
use App\Http\Requests\AplicacionRequest;
use App\Services\AplicacionService;
use App\Services\SimpleExcelExportService;
use Illuminate\Http\JsonResponse;

class AplicacionController extends Controller
{
    public function __construct(
        private AplicacionService $aplicacionService,
        private SimpleExcelExportService $simpleExcelExportService,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->aplicacionService->getAll());
    }

    public function store(AplicacionRequest $request): JsonResponse
    {
        $aplicacion = $this->aplicacionService->create($request->validated());

        return response()->json($aplicacion, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->aplicacionService->getById($id));
    }

    public function update(AplicacionRequest $request, int $id): JsonResponse
    {
        $aplicacion = $this->aplicacionService->update($id, $request->validated());

        return response()->json($aplicacion);
    }

    public function destroy(int $id): JsonResponse
    {

        $this->aplicacionService->delete($id);

        return response()->json(null, 204);
    }

    /**
     * Exportar aplicaciones a Excel
     */
    public function exportToExcel()
    {
        return $this->simpleExcelExportService->download(new AplicacionesExport, 'aplicaciones_'.date('Y-m-d_H-i-s').'.xlsx');
    }
}
