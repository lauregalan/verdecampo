<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campo extends Model
{
    protected $fillable = ['nombre', 'latitud', 'longitud', 'hectareas'];

    public function campanias(): HasMany
    {
        return $this->hasMany(Campania::class);
    }
}
