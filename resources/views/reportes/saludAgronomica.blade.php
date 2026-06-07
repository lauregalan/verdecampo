<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de salud agronómica del lote</title>
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

        /* ── Métricas ── */
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
            width: 25%;
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
        .value.na { color: #94a3b8; font-size: 12px; }

        /* ── Grid dos columnas ── */
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

        /* ── Tablas ── */
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
        .center { text-align: center; }

        /* ── Badge de estado ── */
        .badge {
            border-radius: 3px;
            display: inline-block;
            font-size: 8px;
            font-weight: 700;
            padding: 2px 6px;
            text-transform: uppercase;
        }
        .badge-activo    { background: #dcfce7; color: #166534; }
        .badge-inactivo  { background: #fee2e2; color: #991b1b; }
        .badge-barbecho  { background: #fef9c3; color: #854d0e; }
        .badge-default   { background: #f1f5f9; color: #475569; }

        /* ── pH coloreado ── */
        .ph-acido    { color: #b45309; font-weight: 700; }
        .ph-neutro   { color: #166534; font-weight: 700; }
        .ph-alcalino { color: #1d4ed8; font-weight: 700; }

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
    </style>
</head>
<body>

    @php
        $fmt = fn ($v, $dec = 2) => $v !== null ? number_format((float) $v, $dec, ',', '.') : '—';

        $badgeEstado = function (string $estado): string {
            return match(strtolower($estado)) {
                'activo'   => 'badge-activo',
                'inactivo' => 'badge-inactivo',
                'barbecho' => 'badge-barbecho',
                default    => 'badge-default',
            };
        };

        $clasePh = function ($ph): string {
            if ($ph === null || !is_numeric($ph)) return '';
            $v = (float) $ph;
            if ($v < 6.5)  return 'ph-acido';
            if ($v <= 7.5) return 'ph-neutro';
            return 'ph-alcalino';
        };
    @endphp

    {{-- ── Encabezado ── --}}
    <div class="header">
        <p class="brand">Verdecampo</p>
        <h1>Reporte de salud agronómica del lote</h1>
        <p class="muted">Generado el {{ $generado_en->format('d/m/Y H:i') }}</p>
    </div>

    {{-- ── Métricas generales ── --}}
    <div class="metrics">
        <div class="metric">
            <div class="label">Total de lotes</div>
            <div class="value">{{ $resumen['total_lotes'] }}</div>
        </div>
        <div class="metric">
            <div class="label">Hectáreas totales</div>
            <div class="value">{{ $fmt($resumen['hectareas_totales']) }} ha</div>
        </div>
        <div class="metric">
            <div class="label">pH promedio</div>
            @if ($resumen['ph_promedio'] !== null)
                <div class="value {{ $clasePh($resumen['ph_promedio']) }}">
                    {{ $fmt($resumen['ph_promedio']) }}
                </div>
            @else
                <div class="value na">Sin datos</div>
            @endif
        </div>
        <div class="metric">
            <div class="label">Napa promedio (m)</div>
            @if ($resumen['napa_promedio'] !== null)
                <div class="value">{{ $fmt($resumen['napa_promedio']) }} m</div>
            @else
                <div class="value na">Sin datos</div>
            @endif
        </div>
    </div>

    @if ($resumen['total_lotes'] === 0)
        <div class="empty">No hay lotes registrados para generar el reporte.</div>
    @else

        {{-- ── Grid: estado + pH ── --}}
        <div class="grid">
            <div class="col">
                <h2>Distribución por estado</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Estado</th>
                            <th class="number">Lotes</th>
                            <th class="number">Hectáreas</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($por_estado as $fila)
                            <tr>
                                <td>
                                    <span class="badge {{ $badgeEstado($fila['estado']) }}">
                                        {{ $fila['estado'] }}
                                    </span>
                                </td>
                                <td class="number">{{ $fila['cantidad_lotes'] }}</td>
                                <td class="number">{{ $fmt($fila['hectareas_total']) }} ha</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="col">
                <h2>Distribución por rango de pH</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Rango</th>
                            <th class="number">Lotes</th>
                            <th class="number">Hectáreas</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($por_rango_ph as $fila)
                            <tr>
                                <td>{{ $fila['rango'] }}</td>
                                <td class="number">{{ $fila['cantidad_lotes'] }}</td>
                                <td class="number">{{ $fmt($fila['hectareas_total']) }} ha</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <h2>Cobertura de dato napa</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th class="number">Lotes</th>
                            <th class="number">Hectáreas</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($por_napa as $fila)
                            <tr>
                                <td>{{ $fila['categoria'] }}</td>
                                <td class="number">{{ $fila['cantidad_lotes'] }}</td>
                                <td class="number">{{ $fmt($fila['hectareas_total']) }} ha</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        {{-- ── Listado completo ── --}}
        <h2>Detalle de lotes</h2>
        <table>
            <thead>
                <tr>
                    <th>Lote</th>
                    <th>Campo</th>
                    <th class="center">Estado</th>
                    <th class="number">Ha</th>
                    <th class="number">pH</th>
                    <th class="number">Napa (m)</th>
                    <th>Características</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($listado as $lote)
                    <tr>
                        <td>{{ $lote['nombre'] }}</td>
                        <td>{{ $lote['campo'] }}</td>
                        <td class="center">
                            <span class="badge {{ $badgeEstado($lote['estado']) }}">
                                {{ $lote['estado'] }}
                            </span>
                        </td>
                        <td class="number">
                            {{ $lote['hectareas'] !== null ? $fmt($lote['hectareas']) : '—' }}
                        </td>
                        <td class="number {{ $clasePh($lote['ph']) }}">
                            {{ $fmt($lote['ph']) }}
                        </td>
                        <td class="number">{{ $fmt($lote['napa']) }}</td>
                        <td>{{ $lote['caracteristicas'] ?: '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

    @endif

    <div class="footer">
        pH: ácido &lt; 6,5 · neutro 6,5–7,5 · alcalino &gt; 7,5 &nbsp;|&nbsp;
        Napa expresada en metros desde la superficie.
    </div>

</body>
</html>