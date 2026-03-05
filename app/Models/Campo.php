<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campo extends Model
{
    protected $fillable = ['nombre', 'latitud', 'longitud', 'hectareas'];
}
