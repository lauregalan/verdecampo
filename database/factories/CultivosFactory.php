<?php

namespace Database\Factories;

use App\Models\Cultivo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cultivo>
 */
class CultivosFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
                'tipo' => $this->faker->randomElement(['Soja', 'Trigo', 'Maíz', 'Girasol']),
                'variedad' => function(array $attributes)
                {
                    switch ($attributes['tipo']) {
                        case 'Soja':
                            return 'Baguette 620';
                        case 'Trigo':
                            return 'Candeal';
                        case 'Maíz':
                            return 'Pioneer 30Y87';
                        default:
                            return 'DK 72-72 VT3P';
                    }
                },
                'cultivo_antecesor_id' => Cultivo::factory(),
                'notas' => $this->faker->word(),
        ];
    }
}
