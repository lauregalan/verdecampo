<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de productividad por campaña</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            color: #1f2933;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.35;
            margin: 0;
        }

        h1, h2, h3, p {
            margin: 0;
        }

        .header {
            border-bottom: 3px solid #166534;
            margin-bottom: 18px;
            padding-bottom: 12px;
        }

        .brand {
            color: #166534;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        h1 {
            font-size: 24px;
            margin-top: 4px;
        }

        .muted {
            color: #64748b;
        }

        .metrics {
            display: table;
            margin: 18px 0;
            table-layout: fixed;
            width: 100%;
        }

        .metric {
            border: 1px solid #d8e2dc;
            display: table-cell;
            padding: 12px;
            width: 25%;
        }

        .metric + .metric {
            border-left: 0;
        }

        .label {
            color: #64748b;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .value {
            color: #0f172a;
            font-size: 18px;
            font-weight: 700;
            margin-top: 4px;
        }

        .highlights {
            display: table;
            margin-bottom: 18px;
            table-layout: fixed;
            width: 100%;
        }

        .highlight {
            border: 1px solid #d8e2dc;
            display: table-cell;
            padding: 12px;
            width: 50%;
        }

        .highlight + .highlight {
            border-left: 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th {
            background: #166534;
            color: white;
            font-size: 9px;
            padding: 8px 6px;
            text-align: left;
            text-transform: uppercase;
        }

        td {
            border-bottom: 1px solid #e5e7eb;
            padding: 7px 6px;
            vertical-align: top;
        }

        tr:nth-child(even) td {
            background: #f8fafc;
        }

        .number {
            text-align: right;
            white-space: nowrap;
        }

        .empty {
            border: 1px dashed #cbd5e1;
            color: #64748b;
            padding: 24px;
            text-align: center;
        }

        .footer {
            color: #64748b;
            font-size: 9px;
            margin-top: 16px;
            text-align: right;
        }
    </style>
</head>
<body>
    @php
        $fmt = fn ($value, $suffix = '') => is_null($value) ? '-' : number_format((float) $value, 2, ',', '.') . $suffix;
        $date = fn ($value) => $value ? $value->format('d/m/Y') : '-';
    @endphp

    <div class="header">
        <p class="brand">Verdecampo</p>
        <h1>Reporte de productividad por campaña</h1>
        <p class="muted">Generado el {{ $generado_en->format('d/m/Y H:i') }}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="label">Campañas con cosecha</div>
            <div class="value">{{ $resumen['campanias_con_cosecha'] }}</div>
        </div>
        <div class="metric">
            <div class="label">Cosechas registradas</div>
            <div class="value">{{ $resumen['cosechas_registradas'] }}</div>
        </div>
        <div class="metric">
            <div class="label">Rinde promedio</div>
            <div class="value">{{ $fmt($resumen['rinde_promedio_general'], ' kg/ha') }}</div>
        </div>
        <div class="metric">
            <div class="label">Humedad promedio</div>
            <div class="value">{{ $fmt($resumen['humedad_promedio_general'], '%') }}</div>
        </div>
    </div>

    <div class="highlights">
        <div class="highlight">
            <div class="label">Mejor resultado</div>
            <h3>{{ $mejor_campania['nombre'] ?? 'Sin datos' }}</h3>
            <p class="muted">{{ isset($mejor_campania) ? $fmt($mejor_campania['rinde_promedio'], ' kg/ha') : '-' }}</p>
        </div>
        <div class="highlight">
            <div class="label">Peor resultado</div>
            <h3>{{ $peor_campania['nombre'] ?? 'Sin datos' }}</h3>
            <p class="muted">{{ isset($peor_campania) ? $fmt($peor_campania['rinde_promedio'], ' kg/ha') : '-' }}</p>
        </div>
    </div>

    @if ($filas->isEmpty())
        <div class="empty">No hay campañas disponibles para el reporte.</div>
    @else
        <table>
            <thead>
                <tr>
                    <th>Campaña</th>
                    <th>Campo</th>
                    <th>Cultivo</th>
                    <th>Estado</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th class="number">Duracion</th>
                    <th class="number">Cosechas</th>
                    <th class="number">Lotes</th>
                    <th class="number">Rinde prom.</th>
                    <th class="number">Humedad prom.</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($filas as $fila)
                    <tr>
                        <td>{{ $fila['nombre'] }}</td>
                        <td>{{ $fila['campo'] }}</td>
                        <td>{{ $fila['cultivo'] }}</td>
                        <td>{{ $fila['estado'] }}</td>
                        <td>{{ $date($fila['fecha_inicio']) }}</td>
                        <td>{{ $date($fila['fecha_fin']) }}</td>
                        <td class="number">{{ $fila['duracion_dias'] ? $fila['duracion_dias'] . ' dias' : '-' }}</td>
                        <td class="number">{{ $fila['cantidad_cosechas'] }}</td>
                        <td class="number">{{ $fila['lotes_cosechados'] }}</td>
                        <td class="number">{{ $fmt($fila['rinde_promedio'], ' kg/ha') }}</td>
                        <td class="number">{{ $fmt($fila['humedad_promedio'], '%') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        Comparacion calculada por rendimiento promedio de las cosechas registradas por campaña.
    </div>
</body>
</html>
