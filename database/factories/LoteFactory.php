<?php

namespace Database\Factories;

use App\Models\Campo;
use App\Models\Lote;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lote>
 */
class LoteFactory extends Factory
{
    protected $model = Lote::class;

    public function definition(): array
    {
        return [
            'nombre' => 'Lote '.$this->faker->unique()->numberBetween(1, 999),
            'caracteristicas' => $this->faker->sentence(),
            'estado' => 'Disponible',
            'longitud' => (float) $this->faker->longitude(),
            'latitud' => (float) $this->faker->latitude(),
            'hectareas' => $this->faker->randomFloat(2, 5, 150),
            'ph' => $this->faker->randomFloat(2, 5, 8),
            'napa' => $this->faker->randomFloat(2, 0.5, 5),
            'campo_id' => Campo::factory(),
            'polygon' => null,
        ];
    }
}
