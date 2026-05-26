<?php

namespace Database\Factories;

use App\Models\ProductoAplicacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductoAplicacion>
 */
class ProductoAplicacionFactory extends Factory
{
    protected $model = ProductoAplicacion::class;

    public function definition(): array
    {
        return [
            'nombre' => 'Producto '.$this->faker->unique()->word(),
            'concentracion' => $this->faker->randomElement(['24%', '48%', '60%']),
            'tipo' => $this->faker->randomElement(['GRANULADO', 'LIQUIDO']),
        ];
    }
}
