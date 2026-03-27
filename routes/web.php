<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PanelController;

Route::get('/', function () {
    return view('login');
});

Route::get('/panel', [PanelController::class, 'index']);

// Nueva ruta para ver la sección de vacantes
Route::get('/vacantes', [PanelController::class, 'vacantes']);
Route::get('/vacantes/nueva', [PanelController::class, 'nuevaVacante']);


Route::get('/candidatos', [PanelController::class, 'candidatos']);
Route::get('/candidatos/perfil', [PanelController::class, 'perfilCandidato']);
Route::get('/candidatos/nuevo', [PanelController::class, 'crearPerfil']);

Route::get('/catalogo', [PanelController::class, 'catalogo']);
Route::get('/configuracion', [PanelController::class, 'configuracion']);