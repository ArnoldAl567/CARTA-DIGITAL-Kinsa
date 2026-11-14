<?php

use App\Http\Controllers\AdminCatalogController;
use App\Http\Controllers\AdminSessionController;
use App\Http\Controllers\MenuController;
use Illuminate\Support\Facades\Route;

Route::get('/menu', MenuController::class);
Route::get('/menu/fotos/{product}/{version}', [AdminCatalogController::class, 'photo'])
    ->whereNumber('product')->whereUuid('version');

Route::middleware('web')->prefix('administrar')->group(function (): void {
    Route::get('/sesion', [AdminSessionController::class, 'show']);
    Route::post('/sesion', [AdminSessionController::class, 'store'])->middleware('throttle:8,1');

    Route::middleware('auth')->group(function (): void {
        Route::delete('/sesion', [AdminSessionController::class, 'destroy']);
        Route::get('/platos', [AdminCatalogController::class, 'index']);
        Route::post('/platos', [AdminCatalogController::class, 'store']);
        Route::patch('/platos/{product}', [AdminCatalogController::class, 'update'])->whereNumber('product');
    });
});
