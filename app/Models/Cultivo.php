<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cultivo extends Model
{
    protected $fillable = [
        'lote_id',
        'campania_id',
        'tipo',
        'variedad',
        'fecha_siembra',
        'cultivo_antecesor',
        'notas',
    ];

    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class);
    }

    public function campania(): BelongsTo
    {
        return $this->belongsTo(Campania::class);
    }
}
