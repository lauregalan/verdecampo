<?php

namespace App\Http\Controllers;

use App\Models\Siembra;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\SiembraRequest;
use App\Services\SiembraService;

class SiembraController extends Controller
{
    public function __construct(private SiembraService $siembraService)
    {
        //
    }   
    /**
     * Display a listing of the resource.
     */
    public function showAll(): JsonResponse
    {
        //
        $siembras = $this->siembraService->getAll();
        return response()->json($siembras, 200);
    }


    /**
     * Show the form for creating a new resource.
     */
    //public function create()
    //{
        //

    //}

    /**
     * Store a newly created resource in storage.
     */
    public function store(SiembraRequest $request)
    {
        //
        $siembra = $this->siembraService->create($request->validated());
        return response()->json($siembra, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $siembra = $this->siembraService->getById($id);
        return response()->json($siembra, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Siembra $siembra)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SiembraRequest $request, int $id): JsonResponse
    {
        //
        $siembra = $this->siembraService->update($id, $request->validated());
        return response()->json($siembra, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        //
        $siembra = $this->siembraService->delete($id);
        return response()->json($siembra, 200);
    }
}
