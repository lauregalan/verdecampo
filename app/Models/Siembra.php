<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siembra extends Model
{
    //
    protected $table = 'siembras';

    protected $fillable = [
        'campania_id',
        'lote_id',
        'cultivo_id',
        'fecha_siembra',
        'observaciones',
    ];

    // Relaciones---------
    public function campania()
    {
        return $this->belongsTo(Campania::class);
    }

    public function lote()
    {
        return $this->belongsTo(Lote::class);
    }

    public function cultivo()
    {
        return $this->belongsTo(Cultivo::class);
    }

    //Attribute: último cultivo que tuvo el lote ---
    public function getUltimoCultivoAttribute()
    {
        return Attribute::make(
            get: function () {
                //Busca la siembra anterior a esta en el mismo lote
                $siembraAnterior = Siembra::where('lote_id', $this->lote_id)
                    ->where('id', '<', $this->id)
                    ->orderBy('fecha_siembra')
                    ->with('cultivo')
                    ->first();

                    return $siembraAnterior?->cultivo?->nombre ?? 'Sin antecesor';

            }
        );
    }
}
