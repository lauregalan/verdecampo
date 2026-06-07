<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de Catálogo de Productos</title>
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
            width: 100%; /* Esto asegura que ocupe todo el ancho disponible */
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
        .success-empty {
            border: 1px solid #bbf7d0;
            background-color: #f0fdf4;
            color: #166534;
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

    <div class="header">
        <p class="brand">Verdecampo</p>
        <h1>Catálogo de Productos y Uso</h1>
        <p class="muted">Generado el {{ date('d/m/Y H:i') }}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="label">Insumos sin uso (Stock Muerto)</div>
            <div class="value">{{ count($insumos_sin_uso) }}</div>
        </div>
        <div class="metric">
            <div class="label">Categorías Activas</div>
            <div class="value">{{ count($ranking_tipos) }}</div>
        </div>
        <div class="metric">
            <div class="label">Métodos de Aplicación</div>
            <div class="value">{{ count($distribucion_tipos_aplicacion) }}</div>
        </div>
    </div>

    <h2>Ranking de Productos Más Usados (Top 10)</h2>
    @if(count($ranking_productos) > 0)
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Concentración</th>
                    <th class="number">Cant. de Aplicaciones</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($ranking_productos as $prod)
                    <tr>
                        <td>{{ $prod->nombre }}</td>
                        <td>{{ $prod->tipo }}</td>
                        <td>{{ $prod->concentracion }}</td>
                        <td class="number">{{ $prod->aplicaciones_count }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty">No hay suficientes datos de aplicaciones para armar un ranking.</div>
    @endif

    <div class="grid">
        <div class="col">
            <h2>Tipos de insumo más usados</h2>
            @if(count($ranking_tipos) > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Tipo / Categoría</th>
                            <th class="number">Total Usos</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($ranking_tipos as $tipo)
                            <tr>
                                <td>{{ $tipo->tipo }}</td>
                                <td class="number">{{ $tipo->total_usos }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="empty">Sin registros.</div>
            @endif
        </div>

        <div class="col">
            <h2>Distribución por Tipo de Aplicación</h2>
            @if(count($distribucion_tipos_aplicacion) > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Método de Aplicación</th>
                            <th class="number">Cant. de Usos</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($distribucion_tipos_aplicacion as $tipoApp)
                            <tr>
                                <td>{{ $tipoApp->nombre }}</td>
                                <td class="number">{{ $tipoApp->aplicaciones_count }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="empty">Sin registros.</div>
            @endif
        </div>
    </div> <h2>Insumos sin uso registrado</h2>
    @if(count($insumos_sin_uso) > 0)
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Concentración</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($insumos_sin_uso as $insumo)
                    <tr>
                        <td>{{ $insumo->nombre }}</td>
                        <td>{{ $insumo->tipo }}</td>
                        <td>{{ $insumo->concentracion }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="success-empty">
            <strong>Todos los insumos registrados en el catálogo han sido utilizados al menos una vez.</strong>
        </div>
    @endif

    <div class="footer">
        Reporte analítico generado automáticamente.
    </div>

</body>
</html>
