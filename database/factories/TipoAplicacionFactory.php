<?php

namespace Database\Factories;

use App\Models\TipoAplicacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TipoAplicacion>
 */
class TipoAplicacionFactory extends Factory
{
    protected $model = TipoAplicacion::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->randomElement(['Fungicida', 'Herbicida', 'Fertilizante']),
        ];
    }
}
