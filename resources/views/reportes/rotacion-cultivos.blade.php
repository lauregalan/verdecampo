<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de Rotación y Antecesores</title>
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
        th.danger-th {
            background: #b91c1c; /* Rojo para alertas */
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
        .success-box {
            border: 1px solid #bbf7d0;
            background-color: #f0fdf4;
            color: #166534;
            padding: 18px;
            text-align: center;
        }
        .danger-box {
            border: 1px solid #fecaca;
            background-color: #fef2f2;
            color: #991b1b;
            padding: 18px;
            text-align: center;
        }
        .footer {
            color: #64748b;
            font-size: 8px;
            margin-top: 12px;
            text-align: right;
        }
        /* Clase para agrupar lotes en el historial visualmente */
        .lote-header td {
            background-color: #e2e8f0 !important;
            font-weight: 700;
            color: #0f172a;
            padding-top: 10px;
        }
    </style>
</head>
<body>

    <div class="header">
        <p class="brand">Verdecampo</p>
        <h1>Rotación y Antecesores de Cultivo</h1>
        <p class="muted">Generado el {{ date('d/m/Y H:i') }}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="label">Lotes Evaluados</div>
            <div class="value">{{ count($rotacion_por_lote) }}</div>
        </div>
        <div class="metric">
            <div class="label">Alertas de Monocultivo</div>
            <div class="value" style="color: {{ count($alertas_repeticion) > 0 ? '#b91c1c' : '#0f172a' }}">
                {{ count($alertas_repeticion) }}
            </div>
        </div>
        <div class="metric">
            <div class="label">Cultivo Predominante</div>
            <div class="value">
                @if(count($frecuencia_cultivos) > 0)
                    {{ $frecuencia_cultivos->first()->tipo }}
                @else
                    N/A
                @endif
            </div>
        </div>
    </div>

    <h2>Alertas de Repetición (Posible Monocultivo)</h2>
    @if(count($alertas_repeticion) > 0)
        <table>
            <thead>
                <tr>
                    <th class="danger-th">Lote Afectado</th>
                    <th class="danger-th">Cultivo Repetido</th>
                    <th class="danger-th">Campaña Anterior</th>
                    <th class="danger-th">Campaña Actual</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($alertas_repeticion as $alerta)
                    <tr>
                        <td><strong>{{ $alerta['lote_nombre'] }}</strong></td>
                        <td>{{ $alerta['cultivo'] }}</td>
                        <td>{{ $alerta['campania_anterior'] }}</td>
                        <td>{{ $alerta['campania_actual'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <p class="muted" style="margin-bottom: 15px; font-size: 8px;">
            * Se detectó el mismo cultivo sembrado en campañas consecutivas, lo que puede afectar la fertilidad del suelo y el ciclo de plagas.
        </p>
    @else
        <div class="success-box" style="margin-bottom: 15px;">
            <strong>¡Excelente rotación!</strong> No se detectaron cultivos repetidos en campañas consecutivas en ningún lote.
        </div>
    @endif

    <div class="grid">
        <div class="col">
            <h2>Frecuencia de Cultivos</h2>
            @if(count($frecuencia_cultivos) > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Cultivo</th>
                            <th>Variedad</th>
                            <th class="number">Cant. Campañas</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($frecuencia_cultivos as $frecuencia)
                            <tr>
                                <td>{{ $frecuencia->tipo }}</td>
                                <td>{{ $frecuencia->variedad ?? '-' }}</td>
                                <td class="number">{{ $frecuencia->campanias_count }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="empty">Sin datos de cultivos.</div>
            @endif
        </div>

        <div class="col">
            <h2>Antecesores Más Comunes</h2>
            @if(count($antecesores_comunes) > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Cultivo Antecesor</th>
                            <th class="number">Veces Utilizado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($antecesores_comunes as $antecesor)
                            <tr>
                                <td>
                                    {{ $antecesor->cultivoAntecesor ? $antecesor->cultivoAntecesor->tipo . ' (' . ($antecesor->cultivoAntecesor->variedad ?? 'General') . ')' : 'Desconocido' }}
                                </td>
                                <td class="number">{{ $antecesor->total }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="empty">No hay registros de relaciones antecesoras en la base de datos.</div>
            @endif
        </div>
    </div>

    <h2>Historial de Rotación por Lote</h2>
    @if(count($rotacion_por_lote) > 0)
        <table>
            <thead>
                <tr>
                    <th>Campaña</th>
                    <th>Cultivo Sembrado</th>
                    <th>Fecha de Inicio</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($rotacion_por_lote as $loteData)
                    <tr class="lote-header">
                        <td colspan="3">Lote: {{ $loteData['lote_nombre'] }}</td>
                    </tr>
                    @foreach ($loteData['historial'] as $registro)
                        <tr>
                            <td style="padding-left: 15px;">{{ $registro['campania_nombre'] }}</td>
                            <td>{{ $registro['cultivo'] }}</td>
                            <td>{{ \Carbon\Carbon::parse($registro['fecha_inicio'])->format('d/m/Y') }}</td>
                        </tr>
                    @endforeach
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty">No hay historial de campañas asignadas a lotes para evaluar la rotación.</div>
    @endif

    <div class="footer">
        Las alertas consideran la secuencia cronológica de siembra.
    </div>

</body>
</html>
