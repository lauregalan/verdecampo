<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Models\User;
use App\Services\RoleService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private RoleService $roleService)
    {
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles:id,name')
            ->orderBy('id')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->values(),
                    'active' => $user->active,
                    'updated_at' => $user->updated_at?->toDateTimeString(),
                    'last_login_at' => $user->last_login_at?->toDateTimeString(),
                    'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
                ];
            });

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function modificarRoles(RoleRequest $request, User $user)
    {
        $roles = $request->validated()['roles'];

        $this->roleService->modificarRoles($user, $roles);

        return response()->json([
            'id' => $user->id,
            'roles' => $roles,
        ]);
    }

    public function getRoles(User $user)
    {
        return response()->json($this->roleService->getRolesByUserId((string) $user->id));
    }

    public function updateActive(Request $request, User $user)
    {
        $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $currentUser = $request->user();

        if (! $currentUser?->hasRole('Productor')) {
            abort(403);
        }

        if ($currentUser->is($user)) {
            return response()->json([
                'message' => 'No puedes cambiar tu propio estado.',
            ], 422);
        }

        $user->active = $request->boolean('active');
        $user->save();

        return response()->json(['id' => $user->id, 'active' => $user->active]);
    }
}
