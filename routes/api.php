<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\AplicacionController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\LoteController;
use App\Http\Controllers\ProductoAplicacionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TipoAplicacionController;
use Illuminate\Support\Facades\Route;

// Rutas públicas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/user', [AuthController::class, 'user']);

    // Campos
    Route::apiResource('campos', App\Http\Controllers\CampoController::class);

    // Campañas
    Route::apiResource('campanias', App\Http\Controllers\CampaniaController::class);
    Route::get('/campanias/{campania}/lotes', [App\Http\Controllers\CampaniaController::class, 'getLotes']);
    Route::post('/campanias/{campania}/lotes', [App\Http\Controllers\CampaniaController::class, 'asignarLotes']);
    Route::delete('/campanias/{campania}/lotes/{loteId}', [App\Http\Controllers\CampaniaController::class, 'quitarLote']);

    // Cultivos
    Route::apiResource('cultivos', CultivoController::class);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);

    // Lotes
    Route::get('/lotes', [LoteController::class, 'showAll']);
    Route::get('/lotes/{id}', [LoteController::class, 'show']);
    Route::post('/lotes', [LoteController::class, 'store']);
    Route::put('/lotes/{id}', [LoteController::class, 'update']);
    Route::delete('/lotes/{id}', [LoteController::class, 'destroy']);
    Route::get('/lotes/campo/{id_campo}', [LoteController::class, 'indexByCampo']);
    Route::get('/lotes/nombre/{nombre}', [LoteController::class, 'indexByName']);
    Route::get('/lotes/campania/{id_campania}', [LoteController::class, 'indexByCampania']);

    // Tipos de aplicaciones
    Route::get('/tipos-aplicaciones', [TipoAplicacionController::class, 'index']);
    Route::get('/tipos-aplicaciones/{id}', [TipoAplicacionController::class, 'show']);
    Route::post('/tipos-aplicaciones', [TipoAplicacionController::class, 'store']);
    Route::put('/tipos-aplicaciones/{id}', [TipoAplicacionController::class, 'update']);
    Route::delete('/tipos-aplicaciones/{id}', [TipoAplicacionController::class, 'destroy']);

    // Productos de aplicaciones
    Route::get('/productos-aplicaciones', [ProductoAplicacionController::class, 'index']);
    Route::get('/productos-aplicaciones/{id}', [ProductoAplicacionController::class, 'show']);
    Route::post('/productos-aplicaciones', [ProductoAplicacionController::class, 'store']);
    Route::put('/productos-aplicaciones/{id}', [ProductoAplicacionController::class, 'update']);
    Route::delete('/productos-aplicaciones/{id}', [ProductoAplicacionController::class, 'destroy']);

    // Aplicaciones
    Route::get('/aplicaciones', [AplicacionController::class, 'index']);
    Route::get('/aplicaciones/{id}', [AplicacionController::class, 'show']);
    Route::post('/aplicaciones', [AplicacionController::class, 'store']);
    Route::put('/aplicaciones/{id}', [AplicacionController::class, 'update']);
    Route::delete('/aplicaciones/{id}', [AplicacionController::class, 'destroy']);
});
