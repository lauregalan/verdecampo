<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cosecha extends Model
{
    protected $fillable = [
        'campania_id',
        'lote_id',
        'fecha',
        'rinde',
        'humedad',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function campania(): BelongsTo
    {
        return $this->belongsTo(Campania::class);
    }

    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class);
    }
}
