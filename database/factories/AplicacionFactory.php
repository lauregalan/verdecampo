<?php

namespace Database\Factories;

use App\Models\Aplicacion;
use App\Models\Campania;
use App\Models\Lote;
use App\Models\ProductoAplicacion;
use App\Models\TipoAplicacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aplicacion>
 */
class AplicacionFactory extends Factory
{
    protected $model = Aplicacion::class;

    public function definition(): array
    {
        return [
            'producto_aplicacion_id' => ProductoAplicacion::factory(),
            'tipo_aplicacion_id' => TipoAplicacion::factory(),
            'campania_id' => Campania::factory(),
            'lote_id' => Lote::factory(),
            'cantidad' => $this->faker->randomFloat(2, 1, 500),
            'unidad' => $this->faker->randomElement(['L/ha', 'kg/ha']),
            'fecha' => $this->faker->date(),
            'precio_labor' => $this->faker->randomFloat(2, 1000, 50000),
            'moneda_precio_labor' => 'ARS',
            'observaciones' => $this->faker->sentence(),
        ];
    }
}
