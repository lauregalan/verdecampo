<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'Hola!']);
});

Route::get('/roles', [App\Http\Controllers\RolesController::class, 'index']);
