<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\LoteController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});


Route::apiResource('campos', App\Http\Controllers\CampoController::class);
Route::apiResource('campanias', App\Http\Controllers\CampaniaController::class);

Route::get('/roles', [RoleController::class, 'index']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}/roles', [UserController::class, 'getRoles']);
Route::put('/users/{id}/roles', [UserController::class, 'modificarRoles']);
Route::get('/lotes/{id}', [LoteController::class, 'show']);
Route::post('/lotes', [LoteController::class, 'store']);
Route::put('/lotes/{id}', [LoteController::class, 'update']);
Route::delete('/lotes/{id}', [LoteController::class, 'destroy']);
Route::get('/lotes/campo/{id_campo}', [LoteController::class, 'indexByCampo']);
Route::get('/lotes/nombre/{nombre}', [LoteController::class, 'indexByName']);
Route::get('/lotes/campania/{id_campania}', [LoteController::class, 'indexByCampania']);

