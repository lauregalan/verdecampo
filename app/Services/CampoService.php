<?php

namespace App\Services;

use App\Models\Campo;
use Illuminate\Support\Facades\Http;

class CampoService
{
    public function index()
    {
        $campos = Campo::with(['campanias' => function($query) {
            $query->where('estado', 'En Curso')->with('cultivo');
        }])->get();

        return $campos->map(function($campo) {
            $campaniaEnCurso = $campo->campanias->first();
            $cultivo = $campaniaEnCurso ? $campaniaEnCurso->cultivo : null;
            $campo->cultivo_actual = $cultivo ? $cultivo->tipo : 'Sin siembras';
            return $campo;
        });
    }

    public function show(Campo $campo)
    {
        $campo->load(['campanias' => function($query) {
            $query->where('estado', 'En Curso')->with('cultivo');
        }]);

        $campaniaEnCurso = $campo->campanias->first();
        $cultivo = $campaniaEnCurso ? $campaniaEnCurso->cultivo : null;
        $campo->cultivo_actual = $cultivo ? $cultivo->tipo : 'Sin siembras';

        // Obtener datos del clima usando Open-Meteo
        $campo->clima = $this->getClima($campo->latitud, $campo->longitud);

        return $campo;
    }

    private function getClima($latitud, $longitud)
    {
        try {
            $response = Http::timeout(10)->withoutVerifying()->get('https://api.open-meteo.com/v1/forecast', [
                'latitude' => $latitud,
                'longitude' => $longitud,
                'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
                'timezone' => 'auto',
                'forecast_days' => 7
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'temperatura_max' => $data['daily']['temperature_2m_max'] ?? [],
                    'temperatura_min' => $data['daily']['temperature_2m_min'] ?? [],
                    'precipitacion' => $data['daily']['precipitation_sum'] ?? [],
                    'codigo_clima' => $data['daily']['weathercode'] ?? [],
                    'fechas' => $data['daily']['time'] ?? []
                ];
            }
        } catch (\Exception $e) {
            // En caso de error, devolver datos vacíos
        }

        return [
            'temperatura_max' => [],
            'temperatura_min' => [],
            'precipitacion' => [],
            'codigo_clima' => [],
            'fechas' => []
        ];
    }

    public function store(array $data)
    {
        $campo = Campo::create($data);

        return $campo;
    }

    public function update(Campo $campo, array $data)
    {
        $campo->update($data);

        return $campo;
    }

    public function destroy(Campo $campo)
    {
        $campo->delete();
    }
}
