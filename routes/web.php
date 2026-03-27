<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if(Auth::check()){
        return Redirect('/dashboard');
    }
    else{
        return Redirect('/login');
    }
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::get('/campo', function () {
    return Inertia::render('Campos/Campo');
})->middleware(['auth', 'verified'])->name('campo');

Route::get('/campo/{campoId}', function (int $campoId) {
    return Inertia::render('Campos/CampoDetalle', [
        'campoId' => $campoId,
    ]);
})->middleware(['auth', 'verified'])->whereNumber('campoId')->name('campo.detalle');

Route::get('/lotes/crear/{campoId}', function (int $campoId) {
    return Inertia::render('Lotes/FormularioLote', [
        'campoId' => $campoId,
    ]);
})->middleware(['auth', 'verified'])->whereNumber('campoId')->name('lotes.crear');

Route::get('/usuarios', function () {
    return Inertia::render('Usuarios/GestionarUsuarios');
})->middleware(['auth', 'verified'])->name('gestionarUsuarios');

Route::prefix('api')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}/roles', [UserController::class, 'getRoles']);
    Route::patch('/users/{user}/active', [UserController::class, 'updateActive']);
    Route::put('/users/{user}/roles', [UserController::class, 'modificarRoles']);
});

Route::get('/main', function () {
    return Redirect('/usuarios');
})->middleware(['auth', 'verified'])->name('main');

Route::get('/campanias', function () {
    return Inertia::render('Campanias/Campania');
})->middleware(['auth', 'verified'])->name('gestionarCampanias');

Route::get('/campania', function () {
    return Redirect('/campanias');
})->middleware(['auth', 'verified'])->name('gestionarCampañas');


require __DIR__.'/auth.php';
