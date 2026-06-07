<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de uso de insumos y aplicaciones</title>
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
    </style>
</head>
<body>
    @php
        $money = fn ($items) => $items->isEmpty()
            ? '-'
            : $items->map(fn ($item) => $item['moneda'] . ' ' . number_format((float) $item['total'], 2, ',', '.'))->join(' / ');
        $qty = fn ($items) => $items->isEmpty()
            ? '-'
            : $items->map(fn ($item) => number_format((float) $item['cantidad'], 2, ',', '.') . ' ' . $item['unidad'])->join(' / ');
    @endphp

    <div class="header">
        <p class="brand">Verdecampo</p>
        <h1>Reporte de uso de insumos y aplicaciones</h1>
        <p class="muted">Generado el {{ $generado_en->format('d/m/Y H:i') }}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="label">Aplicaciones registradas</div>
            <div class="value">{{ $resumen['total_aplicaciones'] }}</div>
        </div>
        <div class="metric">
            <div class="label">Costo operativo total</div>
            <div class="value">{{ $money($resumen['costo_total']) }}</div>
        </div>
        <div class="metric">
            <div class="label">Filtro</div>
            <div class="value">{{ $campania_id ? 'Campania #' . $campania_id : 'Todas' }}</div>
        </div>
    </div>

    @if ($resumen['total_aplicaciones'] === 0)
        <div class="empty">No hay aplicaciones disponibles para el reporte.</div>
    @else
        <h2>Costo y aplicaciones por campana</h2>
        <table>
            <thead>
                <tr>
                    <th>Campana</th>
                    <th class="number">Aplicaciones</th>
                    <th>Cantidad insumo</th>
                    <th>Costo operativo</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($por_campania as $fila)
                    <tr>
                        <td>{{ $fila['nombre'] }}</td>
                        <td class="number">{{ $fila['cantidad_aplicaciones'] }}</td>
                        <td>{{ $qty($fila['cantidad_insumo']) }}</td>
                        <td>{{ $money($fila['costo_total']) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="grid">
            <div class="col">
                <h2>Aplicaciones por lote</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Lote</th>
                            <th class="number">Aplicaciones</th>
                            <th>Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($por_lote as $fila)
                            <tr>
                                <td>{{ $fila['nombre'] }}</td>
                                <td class="number">{{ $fila['cantidad_aplicaciones'] }}</td>
                                <td>{{ $money($fila['costo_total']) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="col">
                <h2>Aplicaciones por producto</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th class="number">Aplicaciones</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($por_producto as $fila)
                            <tr>
                                <td>{{ $fila['nombre'] }}</td>
                                <td class="number">{{ $fila['cantidad_aplicaciones'] }}</td>
                                <td>{{ $qty($fila['cantidad_insumo']) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <h2>Aplicaciones por tipo</h2>
        <table>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th class="number">Aplicaciones</th>
                    <th>Cantidad insumo</th>
                    <th>Costo operativo</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($por_tipo as $fila)
                    <tr>
                        <td>{{ $fila['nombre'] }}</td>
                        <td class="number">{{ $fila['cantidad_aplicaciones'] }}</td>
                        <td>{{ $qty($fila['cantidad_insumo']) }}</td>
                        <td>{{ $money($fila['costo_total']) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        El costo operativo se calcula sumando el precio de labor registrado en cada aplicacion, separado por moneda.
    </div>
</body>
</html>
