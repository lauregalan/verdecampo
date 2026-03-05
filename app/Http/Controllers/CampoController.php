<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCampoRequest;
use App\Http\Requests\UpdateCampoRequest;
use App\Http\Services\CampoService;
use App\Models\Campo;
use Illuminate\Http\JsonResponse;

class CampoController extends Controller
{
    public function __construct(private CampoService $campoService) {}

    public function index(): JsonResponse
    {
        return $this->campoService->index();
    }

    public function store(StoreCampoRequest $request): JsonResponse
    {
        return $this->campoService->store($request->validated());
    }

    public function show(Campo $campo): JsonResponse
    {
        return $this->campoService->show($campo);
    }
    public function update(UpdateCampoRequest $request, Campo $campo): JsonResponse
    {
        return $this->campoService->update($request->validated(), $campo);
    }
    public function destroy(Campo $campo): JsonResponse
    {
        return $this->campoService->destroy($campo);
    }
}
