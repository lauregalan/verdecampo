<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\InvitarController;
use App\Http\Controllers\LoteController;
use App\Http\Controllers\RoleController;
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


    //usuarios
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}/roles', [UserController::class, 'getRoles']);
    Route::put('/users/{id}/roles', [UserController::class, 'modificarRoles']);

  
    Route::post('/invitar', [InvitarController::class, 'generarInvitacion']);
    // Cultivos
    Route::apiResource('cultivos', CultivoController::class);
    Route::get('/cultivos/campania/{campaniaId}', [CultivoController::class, 'getByCampania']);
    Route::get('/cultivos/lote/{loteId}', [CultivoController::class, 'getByLote']);
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

    // Siembras
    Route::get('/siembras', [App\Http\Controllers\SiembraController::class, 'showAll']);
    Route::get('/siembras/{id}', [App\Http\Controllers\SiembraController::class, 'show']);
    Route::post('/siembras', [App\Http\Controllers\SiembraController::class, 'store']);
    Route::put('/siembras/{id}', [App\Http\Controllers\SiembraController::class, 'update']);
    Route::delete('/siembras/{id}', [App\Http\Controllers\SiembraController::class, 'destroy']);
});
