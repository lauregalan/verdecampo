<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Campania extends Model
{
    protected $fillable = [
        'campo_id',
        'nombre',
        'cultivo',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    public function campo(): BelongsTo
    {
        return $this->belongsTo(Campo::class);
    }

    public function lotes()
    {
        return $this->belongsToMany(Lote::class, 'campania_lote')
                    ->withTimestamps();
    }
}
