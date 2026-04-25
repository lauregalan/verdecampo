<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cultivo extends Model
{
    protected $fillable = [
        'tipo',
        'variedad',
        'cultivo_antecesor_id',
        'notas',
    ];

    public function campanias(): HasMany
    {
        return $this->hasMany(Campania::class);
    }

    public function cultivoAntecesor(): BelongsTo
    {
        return $this->belongsTo(Cultivo::class, 'cultivo_antecesor_id');
    }
}
