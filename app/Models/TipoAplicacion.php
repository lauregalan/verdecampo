<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoAplicacion extends Model
{
    use HasFactory;

    protected $table = 'tipos_aplicaciones';

    protected $fillable = [
        'nombre',
    ];

    public function aplicaciones(): HasMany
    {
        return $this->hasMany(Aplicacion::class);
    }
}
