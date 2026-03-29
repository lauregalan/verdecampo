<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\LoteController;
use App\Http\Controllers\CultivoController;

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});


Route::apiResource('campos', App\Http\Controllers\CampoController::class);
Route::apiResource('campanias', App\Http\Controllers\CampaniaController::class);
Route::get('/campanias/{campania}/lotes', [App\Http\Controllers\CampaniaController::class, 'getLotes']);
Route::post('/campanias/{campania}/lotes', [App\Http\Controllers\CampaniaController::class, 'asignarLotes']);
Route::delete('/campanias/{campania}/lotes/{loteId}', [App\Http\Controllers\CampaniaController::class, 'quitarLote']);

Route::apiResource('cultivos', CultivoController::class);
Route::get('/cultivos/campania/{campaniaId}', [CultivoController::class, 'getByCampania']);
Route::get('/cultivos/lote/{loteId}', [CultivoController::class, 'getByLote']);  //esta no se usa pero como no sepo no lo borro

Route::get('/roles', [RoleController::class, 'index']);


Route::get('/lotes', [LoteController::class, 'showAll']);
Route::get('/lotes/{id}', [LoteController::class, 'show']);
Route::post('/lotes', [LoteController::class, 'store']);
Route::put('/lotes/{id}', [LoteController::class, 'update']);
Route::delete('/lotes/{id}', [LoteController::class, 'destroy']);
Route::get('/lotes/campo/{id_campo}', [LoteController::class, 'indexByCampo']);
Route::get('/lotes/nombre/{nombre}', [LoteController::class, 'indexByName']);
Route::get('/lotes/campania/{id_campania}', [LoteController::class, 'indexByCampania']);
