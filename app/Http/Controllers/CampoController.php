<?php

namespace App\Http\Controllers;

use App\Http\Requests\CampoRequest;
use App\Models\Campo;
use App\Services\CampoService;
use Illuminate\Http\JsonResponse;

class CampoController extends Controller
{
    public function __construct(private CampoService $campoService) {}

    public function index(): JsonResponse
    {
        $campos = $this->campoService->index();

        return response()->json($campos);
    }

    public function store(CampoRequest $request): JsonResponse
    {
        $campo = $this->campoService->store($request->validated());

        return response()->json($campo, 201);
    }

    public function show(Campo $campo): JsonResponse
    {
        $campo = $this->campoService->show($campo);

        return response()->json($campo);
    }

    public function update(CampoRequest $request, Campo $campo): JsonResponse
    {
        $campo = $this->campoService->update($campo, $request->validated());

        return response()->json($campo);
    }

    public function destroy(Campo $campo): JsonResponse
    {
        $this->campoService->destroy($campo);

        return response()->json(null, 204);
    }
}
