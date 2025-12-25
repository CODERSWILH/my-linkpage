<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\LinkAdminController;

Route::get('/', [LinkController::class, 'public'])->name('home');

Route::get('/admin/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/admin/login', [AuthController::class, 'login'])->name('admin.login.post');
Route::get('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');
Route::get('/admin/links/{id}', [App\Http\Controllers\Admin\LinkAdminController::class, 'show'])->name('admin.links.show');

Route::middleware(['web','auth'])->prefix('admin')->name('admin.')->group(function(){
    Route::get('/dashboard', [LinkAdminController::class, 'index'])->name('dashboard');
    Route::post('/links', [LinkAdminController::class, 'store'])->name('links.store');
    Route::put('/links/{id}', [LinkAdminController::class, 'update'])->name('links.update');
    Route::delete('/links/{id}', [LinkAdminController::class, 'destroy'])->name('links.destroy');
    Route::post('/links/reorder', [LinkAdminController::class, 'reorder'])->name('links.reorder');
    Route::get('/stats', [LinkAdminController::class, 'stats'])->name('stats');

});

Route::post('/api/click', [LinkController::class, 'click'])->name('api.click');



// Route::middleware(['web','auth'])->prefix('admin')->name('admin.')->group(function(){
//     Route::get('/dashboard', [LinkAdminController::class, 'index'])->name('dashboard');
//     Route::post('/links', [LinkAdminController::class, 'store'])->name('links.store');
//     Route::put('/links/{id}', [LinkAdminController::class, 'update'])->name('links.update');
//     Route::delete('/links/{id}', [LinkAdminController::class, 'destroy'])->name('links.destroy');
//     Route::post('/links/reorder', [LinkAdminController::class, 'reorder'])->name('links.reorder');
//     Route::get('/stats', [LinkAdminController::class, 'stats'])->name('stats');
// });

// Route::post('/api/click', [LinkController::class, 'click'])->name('api.click');
