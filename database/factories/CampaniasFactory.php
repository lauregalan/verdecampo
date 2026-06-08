<?php

namespace Database\Factories;

use App\Models\Campania;
use App\Models\Campo;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Cultivo;
/**
 * @extends Factory<Campania>
 */
class CampaniasFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'campo_id' => Campo::factory()->create(),
            'nombre' => $this->faker->word,
            'fecha_inicio' => $this->faker->dateTimeBetween('-1 year','now'),
            'fecha_fin' => $this->faker->dateTimeBetween('now','+1 year'),
            'estado' => $this->faker->randomElement(['Planificada', 'En Curso', 'Finalizada', 'Cancelada']),
            'cultivo_id' => Cultivo::factory()->create(),
        ];
    }
}
