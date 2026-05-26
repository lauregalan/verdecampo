<?php

namespace Database\Factories;

use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Campania>
 */
class CampaniaFactory extends Factory
{
    protected $model = Campania::class;

    public function definition(): array
    {
        $fechaInicio = $this->faker->dateTimeBetween('-6 months', '-1 month');
        $fechaFin = (clone $fechaInicio)->modify('+4 months');

        return [
            'campo_id' => Campo::factory(),
            'cultivo_id' => Cultivo::factory(),
            'nombre' => 'Campania '.$this->faker->unique()->year(),
            'fecha_inicio' => $fechaInicio->format('Y-m-d'),
            'fecha_fin' => $fechaFin->format('Y-m-d'),
            'estado' => $this->faker->randomElement(['Planificada', 'En Curso', 'Finalizada', 'Cancelada']),
        ];
    }
}
