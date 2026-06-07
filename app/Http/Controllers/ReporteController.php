<?php

namespace App\Http\Controllers;

use App\Services\ReporteAplicacionesService;
use App\Services\ReporteProductividadService;
use App\Services\ReporteProductosService;
use App\Services\ReporteRendimientoLotesService;
use App\Services\ReporteRotacionCultivosService;
use App\Services\ReporteSaludAgronomicaService;
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

    public function aplicaciones(Request $request, ReporteAplicacionesService $service): Response
    {
        $campaniaId = $request->integer('campania_id') ?: null;
        $reporte = $service->generar($campaniaId);
        $nombre = $campaniaId
            ? "reporte-aplicaciones-campania-{$campaniaId}.pdf"
            : 'reporte-aplicaciones.pdf';

        return Pdf::loadView('reportes.aplicaciones', $reporte)
            ->setPaper('a4', 'landscape')
            ->download($nombre);
    }

    public function rendimientoLotes(Request $request, ReporteRendimientoLotesService $service): Response
    {
        $campaniaId = $request->integer('campania_id') ?: null;
        $reporte = $service->generar($campaniaId);
        $nombre = $campaniaId
            ? "reporte-rendimiento-lotes-campania-{$campaniaId}.pdf"
            : 'reporte-rendimiento-lotes.pdf';

        return Pdf::loadView('reportes.rendimiento-lotes', $reporte)
            ->setPaper('a4', 'landscape')
            ->download($nombre);
    }

    public function saludAgronomica(Request $request, ReporteSaludAgronomicaService $service): Response
    {
        $reporte = $service->generar();

        return Pdf::loadView('reportes.saludAgronomica', $reporte)
            ->setPaper('a4', 'landscape')
            ->download('reporte-salud-agronomica.pdf');
    }

    public function productos(Request $request, ReporteProductosService $service)
    {
        $reporte = $service->generar();

        return Pdf::loadView('reportes.productos', $reporte)
            ->setPaper('a4', 'landscape')
            ->download('reporte-productos.pdf');
    }

    public function rotacionCultivos(Request $request, ReporteRotacionCultivosService $service)
    {
        $reporte = $service->generar();

        return Pdf::loadView('reportes.rotacion-cultivos', $reporte)
            ->setPaper('a4', 'landscape')
            ->download('reporte-rotacion-cultivos.pdf');
    }
}
