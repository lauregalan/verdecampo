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
        'ph',
        'napa',
        'id_campania',
        'id_campo',
    ];

    public function campo()
    {
        return $this->belongsTo(Campo::class, 'id_campo', 'id');
    }

    // public function campania()
    // {
    //     return $this->belongsTo(Campania::class, 'id_campania');
    // }
}
