<?php

namespace Database\Factories;

use App\Models\Campo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Campo>
 */
class CampoFactory extends Factory
{
    protected $model = Campo::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->word(),
            'latitud' => (string) $this->faker->latitude(),
            'longitud' => (string) $this->faker->longitude(),
            'hectareas' => $this->faker->numberBetween(10, 500),
        ];
    }
}
