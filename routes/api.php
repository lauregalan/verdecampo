<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});

Route::get('/roles', [App\Http\Controllers\RolesController::class, 'index']);

Route::apiResource('campos', App\Http\Controllers\CampoController::class);
Route::get('/roles', [RoleController::class, 'index']);

Route::put('/users/{id}/roles', [UserController::class, 'modificarRoles']);
