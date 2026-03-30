<?php

namespace App\Http\Controllers;

use App\Models\Campania;
use App\Models\Campo;
use App\Models\Cultivo;
use App\Models\Lote;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $isProductor = $user?->hasProductorRole() ?? false;

        if (! $isProductor) {
            return redirect()->route('campo');
        }

        $campaignStatusCounts = Campania::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $loteStatusCounts = Lote::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $pendingUsersQuery = User::query()
            ->with('roles:id,name')
            ->where(function ($query) {
                $query
                    ->where('active', false)
                    ->orWhereDoesntHave('roles');
            });

        $pendingUsers = $isProductor
            ? (clone $pendingUsersQuery)
                ->latest()
                ->limit(5)
                ->get()
                ->map(function (User $pendingUser) {
                    $roles = $pendingUser->roles->pluck('name')->values()->all();
                    $hasRoles = count($roles) > 0;

                    return [
                        'id' => $pendingUser->id,
                        'name' => $pendingUser->name,
                        'email' => $pendingUser->email,
                        'active' => (bool) $pendingUser->active,
                        'roles' => $roles,
                        'created_at' => $pendingUser->created_at?->toDateTimeString(),
                        'reason' => ! $pendingUser->active && ! $hasRoles
                            ? 'Pendiente de activacion y rol'
                            : (! $pendingUser->active ? 'Pendiente de activacion' : 'Sin rol asignado'),
                    ];
                })
                ->values()
                ->all()
            : [];

        $campaignHighlights = Campania::query()
            ->with('campo:id,nombre')
            ->withCount('lotes')
            ->whereIn('estado', ['En Curso', 'Planificada'])
            ->orderByRaw("CASE WHEN estado = 'En Curso' THEN 0 ELSE 1 END")
            ->orderBy('fecha_fin')
            ->orderBy('fecha_inicio')
            ->limit(6)
            ->get()
            ->map(function (Campania $campania) {
                return [
                    'id' => $campania->id,
                    'nombre' => $campania->nombre,
                    'estado' => $campania->estado,
                    'campo_nombre' => $campania->campo?->nombre ?? 'Sin campo',
                    'fecha_inicio' => $campania->fecha_inicio,
                    'fecha_fin' => $campania->fecha_fin,
                    'lotes_count' => $campania->lotes_count,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Dashboard', [
            'summary' => [
                'campos_count' => Campo::count(),
                'lotes_count' => Lote::count(),
                'cultivos_count' => Cultivo::count(),
                'active_campaigns_count' => (int) ($campaignStatusCounts['En Curso'] ?? 0),
                'pending_users_count' => $isProductor ? (clone $pendingUsersQuery)->count() : 0,
                'surface_hectares' => (float) Campo::sum('hectareas'),
            ],
            'campaign_status' => collect(['Planificada', 'En Curso', 'Finalizada', 'Cancelada'])
                ->map(fn (string $status) => [
                    'label' => $status,
                    'count' => (int) ($campaignStatusCounts[$status] ?? 0),
                ])
                ->values()
                ->all(),
            'lote_status' => collect(['produccion', 'barbecho', 'preparacion'])
                ->map(fn (string $status) => [
                    'label' => ucfirst($status),
                    'count' => (int) ($loteStatusCounts[$status] ?? 0),
                ])
                ->values()
                ->all(),
            'campaign_highlights' => $campaignHighlights,
            'pending_users' => $pendingUsers,
            'is_productor' => $isProductor,
        ]);
    }
}
