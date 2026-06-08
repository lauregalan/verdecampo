<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de rendimiento por lote</title>
    <style>
        * { box-sizing: border-box; }
        body {
            color: #1f2933;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.35;
            margin: 0;
        }
        h1, h2, h3, p { margin: 0; }
        .header {
            border-bottom: 3px solid #166534;
            margin-bottom: 14px;
            padding-bottom: 10px;
        }
        .brand {
            color: #166534;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
        }
        h1 { font-size: 22px; margin-top: 4px; }
        h2 {
            color: #0f172a;
            font-size: 14px;
            margin: 14px 0 8px;
        }
        h3 {
            color: #166534;
            font-size: 11px;
            margin: 12px 0 6px;
        }
        .muted { color: #64748b; }
        .metrics {
            display: table;
            margin: 14px 0;
            table-layout: fixed;
            width: 100%;
        }
        .metric {
            border: 1px solid #d8e2dc;
            display: table-cell;
            padding: 10px;
            width: 33.33%;
        }
        .metric + .metric { border-left: 0; }
        .label {
            color: #64748b;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .value {
            color: #0f172a;
            font-size: 16px;
            font-weight: 700;
            margin-top: 4px;
        }
        .grid {
            display: table;
            table-layout: fixed;
            width: 100%;
        }
        .col {
            display: table-cell;
            padding-right: 10px;
            vertical-align: top;
            width: 50%;
        }
        .col + .col {
            padding-left: 10px;
            padding-right: 0;
        }
        table {
            border-collapse: collapse;
            margin-bottom: 8px;
            width: 100%;
        }
        th {
            background: #166534;
            color: white;
            font-size: 8px;
            padding: 6px 5px;
            text-align: left;
            text-transform: uppercase;
        }
        td {
            border-bottom: 1px solid #e5e7eb;
            padding: 6px 5px;
            vertical-align: top;
        }
        tr:nth-child(even) td { background: #f8fafc; }
        .number { text-align: right; white-space: nowrap; }
        .empty {
            border: 1px dashed #cbd5e1;
            color: #64748b;
            padding: 18px;
            text-align: center;
        }
        .footer {
            color: #64748b;
            font-size: 8px;
            margin-top: 12px;
            text-align: right;
        }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    @php
        $fmt = fn ($value, $suffix = '') => is_null($value) ? '-' : number_format((float) $value, 2, ',', '.') . $suffix;
        $date = fn ($value) => $value ? $value->format('d/m/Y') : '-';
    @endphp

    <div class="header">
        <p class="brand">Verdecampo</p>
        <h1>Reporte de rendimiento por lote</h1>
        <p class="muted">Generado el {{ $generado_en->format('d/m/Y H:i') }}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="label">Lotes con cosecha</div>
            <div class="value">{{ $resumen['lotes_con_cosecha'] }}</div>
        </div>
        <div class="metric">
            <div class="label">Cosechas registradas</div>
            <div class="value">{{ $resumen['cosechas_registradas'] }}</div>
        </div>
        <div class="metric">
            <div class="label">Rinde promedio general</div>
            <div class="value">{{ $fmt($resumen['rinde_promedio_general'], ' kg/ha') }}</div>
        </div>
    </div>

    @if ($lotes->isEmpty())
        <div class="empty">No hay cosechas disponibles para el reporte.</div>
    @else
        <div class="grid">
            <div class="col">
                <h2>Lotes mas productivos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Lote</th>
                            <th>Campo</th>
                            <th class="number">Rinde prom.</th>
                            <th class="number">Cosechas</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($mas_productivos as $fila)
                            <tr>
                                <td>{{ $fila['nombre'] }}</td>
                                <td>{{ $fila['campo'] }}</td>
                                <td class="number">{{ $fmt($fila['rinde_promedio'], ' kg/ha') }}</td>
                                <td class="number">{{ $fila['cantidad_cosechas'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="col">
                <h2>Mayor variabilidad</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Lote</th>
                            <th class="number">Desvio</th>
                            <th class="number">Coef. var.</th>
                            <th class="number">Rango</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($mayor_variabilidad as $fila)
                            <tr>
                                <td>{{ $fila['nombre'] }}</td>
                                <td class="number">{{ $fmt($fila['desvio_rinde'], ' kg/ha') }}</td>
                                <td class="number">{{ $fmt($fila['coeficiente_variacion'], '%') }}</td>
                                <td class="number">{{ $fmt($fila['rinde_minimo']) }} - {{ $fmt($fila['rinde_maximo']) }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="muted">Se necesitan al menos dos cosechas por lote para medir variabilidad.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <h2>Resumen por lote</h2>
        <table>
            <thead>
                <tr>
                    <th>Lote</th>
                    <th>Campo</th>
                    <th class="number">Hectareas</th>
                    <th class="number">Cosechas</th>
                    <th class="number">Rinde prom.</th>
                    <th class="number">Min.</th>
                    <th class="number">Max.</th>
                    <th class="number">Desvio</th>
                    <th class="number">Coef. var.</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($lotes as $fila)
                    <tr>
                        <td>{{ $fila['nombre'] }}</td>
                        <td>{{ $fila['campo'] }}</td>
                        <td class="number">{{ $fmt($fila['hectareas'], ' ha') }}</td>
                        <td class="number">{{ $fila['cantidad_cosechas'] }}</td>
                        <td class="number">{{ $fmt($fila['rinde_promedio'], ' kg/ha') }}</td>
                        <td class="number">{{ $fmt($fila['rinde_minimo'], ' kg/ha') }}</td>
                        <td class="number">{{ $fmt($fila['rinde_maximo'], ' kg/ha') }}</td>
                        <td class="number">{{ $fmt($fila['desvio_rinde'], ' kg/ha') }}</td>
                        <td class="number">{{ $fmt($fila['coeficiente_variacion'], '%') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="page-break"></div>
        <h2>Evolucion historica por lote</h2>
        @foreach ($lotes as $fila)
            <h3>{{ $fila['nombre'] }} - {{ $fila['campo'] }}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Campana</th>
                        <th class="number">Rinde por hectarea</th>
                        <th class="number">Humedad</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($fila['evolucion'] as $punto)
                        <tr>
                            <td>{{ $date($punto['fecha']) }}</td>
                            <td>{{ $punto['campania'] }}</td>
                            <td class="number">{{ $fmt($punto['rinde'], ' kg/ha') }}</td>
                            <td class="number">{{ $fmt($punto['humedad'], '%') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endforeach
    @endif

    <div class="footer">
        La variabilidad se calcula con el desvio estandar del rinde por hectarea registrado en cosechas del lote.
    </div>
</body>
</html>
