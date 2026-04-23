<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lote extends Model
{
    protected $table = 'lotes';

    protected $fillable = [
        'nombre',
        'caracteristicas',
        'estado',
        'longitud',
        'latitud',
        'hectareas',
        'ph',
        'napa',
        'campo_id',
    ];

    public function campo()
    {
        return $this->belongsTo(Campo::class, 'campo_id', 'id');
    }

    public function campanias()
    {
        return $this->belongsToMany(Campania::class, 'campania_lote')
            ->withTimestamps();
    }

    public function cultivos()
    {
        return $this->hasMany(Cultivo::class);
    }

    public function aplicaciones()
    {
        return $this->hasMany(Aplicacion::class);
    }
}
