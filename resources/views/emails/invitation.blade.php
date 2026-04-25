<!DOCTYPE html>
<html>
<head>
    <style>
        .card {
            background-color: #0f2e1e; /* El verde oscuro de tu UI */
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .btn {
            background-color: #10b981; /* Esmeralda moderno */
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🌱 Verdecampo</h1>
        <p>Has sido invitado como colaborador.</p>
        <a href="{{ $url }}" class="btn">Configurar mi cuenta</a>
        <p style="font-size: 10px; color: #666; margin-top: 20px;">
            Este link es válido por 48 horas.
        </p>
    </div>
</body>
</html>