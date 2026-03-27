<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\VacantesController;
use App\Http\Controllers\Api\CandidatosController;

// Ruta para obtener los KPIs del panel principal
Route::get('/dashboard/kpis', [DashboardController::class, 'getKpis']);
Route::get('/vacantes/activas', [VacantesController::class, 'getActivas']);
// Ruta para obtener el Top 3 de candidatos de una vacante específica
Route::get('/vacantes/{id}/candidatos', [VacantesController::class, 'getCandidatosTop']);
// Ruta para obtener todo el directorio de candidatos
Route::get('/candidatos', [CandidatosController::class, 'index']);
// Ruta para registrar un nuevo candidato desde el panel de RH
Route::post('/candidatos/registrar', [CandidatosController::class, 'store']);