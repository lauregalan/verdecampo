<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoAplicacion extends Model
{
    protected $table = 'tipos_aplicaciones';

    protected $fillable = [
        'nombre',
    ];

    public function aplicaciones(): HasMany
    {
        return $this->hasMany(Aplicacion::class);
    }
}
