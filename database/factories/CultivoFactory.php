<?php

namespace Database\Factories;

use App\Models\Cultivo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cultivo>
 */
class CultivoFactory extends Factory
{
    protected $model = Cultivo::class;

    public function definition(): array
    {
        $tipo = $this->faker->randomElement(['Soja', 'Trigo', 'Maiz', 'Girasol']);

        return [
            'tipo' => $tipo,
            'variedad' => match ($tipo) {
                'Soja' => 'DM 46R18',
                'Trigo' => 'Baguette 620',
                'Maiz' => 'Pioneer 30Y87',
                default => 'DK 72-72',
            },
            'cultivo_antecesor_id' => null,
            'notas' => $this->faker->sentence(),
        ];
    }
}
