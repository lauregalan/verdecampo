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
                    'updated_at' => $user->updated_at?->toDateTimeString(),
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

    public function modificarRoles(RoleRequest $request, string $id)
    {
        $this->roleService->modificarRoles(User::findOrFail($id), $request->validated()['roles']);
    }

    public function getRoles(string $id)
    {
        return response()->json($this->roleService->getRolesByUserId($id));
    }
}
