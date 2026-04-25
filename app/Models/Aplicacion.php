<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Aplicacion extends Model
{
    protected $table = 'aplicaciones';

    protected $fillable = [
        'producto_aplicacion_id',
        'tipo_aplicacion_id',
        'campania_id',
        'lote_id',
        'cantidad',
        'unidad',
        'fecha',
        'precio_labor',
        'moneda_precio_labor',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'decimal:2',
            'fecha' => 'date',
            'precio_labor' => 'decimal:2',
        ];
    }

    public function productoAplicacion(): BelongsTo
    {
        return $this->belongsTo(ProductoAplicacion::class);
    }

    public function tipoAplicacion(): BelongsTo
    {
        return $this->belongsTo(TipoAplicacion::class);
    }

    public function campania(): BelongsTo
    {
        return $this->belongsTo(Campania::class);
    }

    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class);
    }
}
