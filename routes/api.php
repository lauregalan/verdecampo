<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\AplicacionController;
use App\Http\Controllers\CampaniaController;
use App\Http\Controllers\CampoController;
use App\Http\Controllers\CosechaController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\InvitarController;
use App\Http\Controllers\LoteController;
use App\Http\Controllers\ProductoAplicacionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SiembraController;
use App\Http\Controllers\TipoAplicacionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/test', fn () => response()->json(['message' => 'Hola!']));

Route::middleware('auth:sanctum')->group(function () {
    // Auth (todos los usuarios autenticados)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/user', [AuthController::class, 'user']);

    // Lectura (todos los usuarios autenticados)
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}/roles', [UserController::class, 'getRoles']);

    Route::apiResource('campos', CampoController::class)->only(['index', 'show']);

    Route::apiResource('campanias', CampaniaController::class)->only(['index', 'show']);
    Route::get('/campanias/{campania}/lotes', [CampaniaController::class, 'getLotes']);

    Route::apiResource('cultivos', CultivoController::class)->only(['index', 'show']);
    Route::get('/cultivos/campania/{campaniaId}', [CultivoController::class, 'getByCampania']);
    Route::get('/cultivos/lote/{loteId}', [CultivoController::class, 'getByLote']);

    Route::apiResource('cosechas', CosechaController::class)->only(['index', 'show']);
    Route::get('/cosechas/campania/{campaniaId}', [CosechaController::class, 'getByCampania']);
    Route::get('/cosechas/lote/{loteId}', [CosechaController::class, 'getByLote']);

    Route::get('/lotes', [LoteController::class, 'showAll']);
    Route::get('/lotes/{id}', [LoteController::class, 'show']);
    Route::get('/lotes/campo/{id_campo}', [LoteController::class, 'indexByCampo']);
    Route::get('/lotes/nombre/{nombre}', [LoteController::class, 'indexByName']);
    Route::get('/lotes/campania/{id_campania}', [LoteController::class, 'indexByCampania']);

    Route::get('/tipos-aplicaciones', [TipoAplicacionController::class, 'index']);
    Route::get('/tipos-aplicaciones/{id}', [TipoAplicacionController::class, 'show']);

    Route::get('/productos-aplicaciones', [ProductoAplicacionController::class, 'index']);
    Route::get('/productos-aplicaciones/{id}', [ProductoAplicacionController::class, 'show']);

    Route::get('/aplicaciones', [AplicacionController::class, 'index']);
    Route::get('/aplicaciones/{id}', [AplicacionController::class, 'show']);

    Route::get('/siembras', [SiembraController::class, 'showAll']);
    Route::get('/siembras/{id}', [SiembraController::class, 'show']);

    // Escritura (solo Productor)
    Route::middleware('productor')->group(function () {
        Route::put('/users/{user}/roles', [UserController::class, 'modificarRoles']);
        Route::post('/invitar', [InvitarController::class, 'generarInvitacion']);

        Route::apiResource('campos', CampoController::class)->only(['store', 'update', 'destroy']);

        Route::apiResource('campanias', CampaniaController::class)->only(['store', 'update', 'destroy']);
        Route::post('/campanias/{campania}/lotes', [CampaniaController::class, 'asignarLotes']);
        Route::delete('/campanias/{campania}/lotes/{loteId}', [CampaniaController::class, 'quitarLote']);

        Route::apiResource('cultivos', CultivoController::class)->only(['store', 'update', 'destroy']);

        Route::apiResource('cosechas', CosechaController::class)->only(['store', 'update', 'destroy']);

        Route::post('/lotes', [LoteController::class, 'store']);
        Route::put('/lotes/{id}', [LoteController::class, 'update']);
        Route::delete('/lotes/{id}', [LoteController::class, 'destroy']);

        Route::post('/tipos-aplicaciones', [TipoAplicacionController::class, 'store']);
        Route::put('/tipos-aplicaciones/{id}', [TipoAplicacionController::class, 'update']);
        Route::delete('/tipos-aplicaciones/{id}', [TipoAplicacionController::class, 'destroy']);

        Route::post('/productos-aplicaciones', [ProductoAplicacionController::class, 'store']);
        Route::put('/productos-aplicaciones/{id}', [ProductoAplicacionController::class, 'update']);
        Route::delete('/productos-aplicaciones/{id}', [ProductoAplicacionController::class, 'destroy']);

        Route::post('/aplicaciones', [AplicacionController::class, 'store']);
        Route::put('/aplicaciones/{id}', [AplicacionController::class, 'update']);
        Route::delete('/aplicaciones/{id}', [AplicacionController::class, 'destroy']);

        Route::post('/siembras', [SiembraController::class, 'store']);
        Route::put('/siembras/{id}', [SiembraController::class, 'update']);
        Route::delete('/siembras/{id}', [SiembraController::class, 'destroy']);
    });
});
