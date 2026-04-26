<?php

namespace App\Services;

use App\Models\Cosecha;

class CosechaService
{
    public function index()
    {
        return Cosecha::with(['campania', 'lote'])->get();
    }

    public function show(Cosecha $cosecha)
    {
        return $cosecha->load(['campania', 'lote']);
    }

    public function store(array $data)
    {
        return Cosecha::create($data)->load(['campania', 'lote']);
    }

    public function update(Cosecha $cosecha, array $data)
    {
        $cosecha->update($data);

        return $cosecha->load(['campania', 'lote']);
    }

    public function destroy(Cosecha $cosecha): void
    {
        $cosecha->delete();
    }

    public function getByCampania(int $campaniaId)
    {
        return Cosecha::with('lote')->where('campania_id', $campaniaId)->get();
    }

    public function getByLote(int $loteId)
    {
        return Cosecha::with('campania')->where('lote_id', $loteId)->get();
    }
}
