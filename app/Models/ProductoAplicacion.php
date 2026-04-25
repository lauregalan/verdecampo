<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductoAplicacion extends Model
{
    protected $table = 'productos_aplicaciones';

    protected $fillable = [
        'nombre',
        'concentracion',
        'tipo',
    ];

    public function aplicaciones(): HasMany
    {
        return $this->hasMany(Aplicacion::class);
    }
}
