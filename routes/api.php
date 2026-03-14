<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});


Route::apiResource('campos', App\Http\Controllers\CampoController::class);
Route::apiResource('campanias', App\Http\Controllers\CampaniaController::class);

Route::get('/roles', [RoleController::class, 'index']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}/roles', [UserController::class, 'getRoles']);
Route::put('/users/{id}/roles', [UserController::class, 'modificarRoles']);
