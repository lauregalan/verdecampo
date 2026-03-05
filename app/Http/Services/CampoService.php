<?php

namespace App\Http\Services;

use App\Models\Campo;
use Illuminate\Http\JsonResponse;

class CampoService
{
    public function index(): JsonResponse
    {
        $campos = Campo::all();

        return response()->json($campos);
    }

    public function show(Campo $campo): JsonResponse
    {
        return response()->json($campo);
    }
    public function store(array $data): JsonResponse
    {
        $campo = Campo::create($data);

        return response()->json($campo, 201);
    }

    public function update(array $data, Campo $campo): JsonResponse
    {
        $campo->update($data);

        return response()->json($campo);
    }

    public function destroy(Campo $campo): JsonResponse
    {
        $campo->delete();

        return response()->json(null, 204);
    }
}
