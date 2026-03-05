<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});
Route::apiResource('campos', App\Http\Controllers\CampoController::class);
