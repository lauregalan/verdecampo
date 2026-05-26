<?php

namespace Database\Factories;

use App\Models\Campo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Campo>
 */
class CamposFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->word,
            'latitud'=> $this->faker->randomNumber(),
            'longitud' => $this->faker->randomNumber(), 
            'hectareas' => $this->faker->randomNumber()
        ];
    }
}
