<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CultivoController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});


Route::apiResource('campos', App\Http\Controllers\CampoController::class);

Route::apiResource('cultivos', CultivoController::class);
Route::get('/cultivos/campania/{campaniaId}', [CultivoController::class, 'getByCampania']);
Route::get('/cultivos/lote/{loteId}', [CultivoController::class, 'getByLote']);

Route::get('/roles', [RoleController::class, 'index']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}/roles', [UserController::class, 'getRoles']);
Route::put('/users/{id}/roles', [UserController::class, 'modificarRoles']);
