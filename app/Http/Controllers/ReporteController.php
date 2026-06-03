<?php

namespace App\Http\Controllers;

use App\Services\ReporteProductividadService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReporteController extends Controller
{
    public function productividadCampanias(Request $request, ReporteProductividadService $service): Response
    {
        $campaniaId = $request->integer('campania_id') ?: null;
        $reporte = $service->generar($campaniaId);
        $nombre = $campaniaId
            ? "reporte-productividad-campania-{$campaniaId}.pdf"
            : 'reporte-productividad-campanias.pdf';

        return Pdf::loadView('reportes.productividad-campanias', $reporte)
            ->setPaper('a4', 'landscape')
            ->download($nombre);
    }
}
