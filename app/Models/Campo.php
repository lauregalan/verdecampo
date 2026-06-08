<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['nombre', 'latitud', 'longitud', 'hectareas'];

    public function campanias(): HasMany
    {
        return $this->hasMany(Campania::class);
    }

    public function lotes(): HasMany
    {
        return $this->hasMany(Lote::class);
    }
}
