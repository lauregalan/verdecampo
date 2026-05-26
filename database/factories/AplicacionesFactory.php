<?php

namespace Database\Factories;

use App\Models\Aplicacion;
use App\Models\ProductoAplicacion;
use App\Models\TipoAplicacion;
use App\Models\Campania;
use App\Models\Lote;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aplicacion>
 */
class AplicacionesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
                'producto_aplicacion_id' => ProductoAplicacion::factory() ,
                'tipo_aplicacion_id' => TipoAplicacion::factory(),
                'campania_id' => Campania::factory(),
                'lote_id' => Lote::factoy(),
                'cantidad' => 0,
        ];
    }
}
