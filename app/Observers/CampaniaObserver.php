<?php

namespace App\Observers;

use App\Models\Campania;

class CampaniaObserver
{
    public function updated(Campania $campania): void
    {
        if (! $campania->wasChanged('estado')) {
            return;
        }

        $estadoAnterior = $campania->getOriginal('estado');
        $estadoActual = $campania->estado;

        if ($estadoAnterior === 'Planificada' && $estadoActual === 'En Curso') {
            $this->actualizarEstadoLotes($campania, 'produccion');
            return;
        }

        if ($estadoActual === 'Finalizada') {
            $this->actualizarEstadoLotes($campania, 'disponible');
        }
    }

    private function actualizarEstadoLotes(Campania $campania, string $estado): void
    {
        $campania->lotes()->update(['estado' => $estado]);
    }
}
