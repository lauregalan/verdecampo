<?php

namespace App\Http\Controllers;

use App\Exports\CosechasExport;
use App\Http\Requests\CosechaRequest;
use App\Models\Cosecha;
use App\Services\CosechaService;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;

class CosechaController extends Controller
{
    public function __construct(private CosechaService $cosechaService) {}

    public function index(): JsonResponse
    {
        return response()->json($this->cosechaService->index());
    }

    public function show(Cosecha $cosecha): JsonResponse
    {
        return response()->json($this->cosechaService->show($cosecha));
    }

    public function store(CosechaRequest $request): JsonResponse
    {
        $cosecha = $this->cosechaService->store($request->validated());

        return response()->json($cosecha, 201);
    }

    public function update(CosechaRequest $request, Cosecha $cosecha): JsonResponse
    {
        $cosecha = $this->cosechaService->update($cosecha, $request->validated());

        return response()->json($cosecha);
    }

    public function destroy(Cosecha $cosecha): JsonResponse
    {

        $this->cosechaService->destroy($cosecha);

        return response()->json(null, 204);
    }

    public function getByCampania(int $campaniaId): JsonResponse
    {
        return response()->json($this->cosechaService->getByCampania($campaniaId));
    }

    /**
     * Exportar cosechas a Excel
     */
    public function exportToExcel()
    {
        return Excel::download(new CosechasExport, 'cosechas_'.date('Y-m-d_H-i-s').'.xlsx');
    }

    public function getByLote(int $loteId): JsonResponse
    {
        return response()->json($this->cosechaService->getByLote($loteId));
    }
}
