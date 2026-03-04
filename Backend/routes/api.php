<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\PadreController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReporteController;




Route::post('/login', [AuthController::class, 'login']);

Route::middleware('basic.usuario')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


    // CRUD Escuelas
    Route::get('/schools', [SchoolController::class, 'index']);
    Route::get('/schools/{id}', [SchoolController::class, 'show']);
    Route::post('/schools', [SchoolController::class, 'store']);
    Route::put('/schools/{id}', [SchoolController::class, 'update']);
    Route::delete('/schools/{id}', [SchoolController::class, 'destroy']);

    // CRUD Alumnos
    Route::get('/alumnos', [AlumnoController::class, 'index']);
    Route::get('/alumnos/{id}', [AlumnoController::class, 'show']);
    Route::post('/alumnos', [AlumnoController::class, 'store']);
    Route::put('/alumnos/{id}', [AlumnoController::class, 'update']);
    Route::delete('/alumnos/{id}', [AlumnoController::class, 'destroy']);

    // CRUD Padres
    Route::get('/padres', [PadreController::class, 'index']);
    Route::get('/padres/{id}', [PadreController::class, 'show']);
    Route::post('/padres', [PadreController::class, 'store']);
    Route::put('/padres/{id}', [PadreController::class, 'update']);
    Route::delete('/padres/{id}', [PadreController::class, 'destroy']);

    //Dashboard
    Route::get('/dashboard-data', [DashboardController::class, 'index']);

    //Reportes
    Route::get('/reportes/escuelas', [ReporteController::class, 'reporteEscuelas']);
    Route::get('/reportes/alumnos', [ReporteController::class, 'reporteAlumnos']);
});
