<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lote extends Model
{
    use HasFactory, SoftDeletes;

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
        'polygon',
    ];

    protected $casts = [
        'polygon' => 'array',
    ];

    public function campo()
    {
        return $this->belongsTo(Campo::class, 'campo_id', 'id')->withTrashed();
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

    public function cosechas()
    {
        return $this->hasMany(Cosecha::class);
    }

    public function aplicaciones()
    {
        return $this->hasMany(Aplicacion::class);
    }

    public function siembras()
    {
        return $this->hasMany(Siembra::class);
    }
}
