<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campania extends Model
{
    protected $fillable = [
        'campo_id',
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'cultivo_id',
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

    public function cultivo(): BelongsTo
    {
        return $this->belongsTo(Cultivo::class);
    }

    public function cosechas(): HasMany
    {
        return $this->hasMany(Cosecha::class);
    }

    public function aplicaciones()
    {
        return $this->hasMany(Aplicacion::class);
    }
}
