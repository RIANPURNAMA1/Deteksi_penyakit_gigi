<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\ConsultationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes ini menggunakan middleware "api" dan "auth:sanctum" untuk route
| yang memerlukan autentikasi.
|
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/consultations/{id}/send-email', [ConsultationController::class, 'sendEmail']);
});


Route::middleware('auth:sanctum')->get('/consultations/user', [ConsultationController::class, 'userAll']);

// ==============================
// AUTHENTICATION
// ==============================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

// Route yang memerlukan autentikasi
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Premium
    Route::get('/user/status', function (Request $request) {
        return response()->json([
            'isPremium' => $request->user()->is_premium,
        ]);
    });

    Route::post('/user/premium/activate', function (Request $request) {
        $user = $request->user();
        $user->is_premium = true;
        $user->save();

        return response()->json(['success' => true]);
    });
});

// ==============================
// MIDTRANS PAYMENT
// ==============================
Route::post('/midtrans/token', [MidtransController::class, 'createTransaction']);
Route::post('/midtrans/notification', [MidtransController::class, 'handleNotification']);

// ==============================
// CONSULTATION
// ==============================
// routes/api.php




Route::middleware('auth:sanctum')->group(function () {
    // User hanya bisa lihat konsultasi sendiri
    Route::get('/consultations', [ConsultationController::class, 'index']);
 
    // hapus data pasien
     Route::delete('/consultations/{id}', [ConsultationController::class, 'destroy']);  
    // Simpan konsultasi baru
    Route::post('/consultations', [ConsultationController::class, 'store']);

    // Catatan dokter
    Route::post('/consultations/{id}/doctor-note', [ConsultationController::class, 'saveDoctorNote']);
    Route::delete('/consultations/{id}/doctor-note', [ConsultationController::class, 'deleteDoctorNote']);

    // Referral (optional)
    Route::delete('/consultations/{id}/referral', [ConsultationController::class, 'deleteReferral']);
});

// ==============================
// ARCHIVE
// ==============================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/arsip', [ArchiveController::class, 'saveArsip']);
    Route::get('/arsip', [ArchiveController::class, 'index']);
});

// ==============================
// TEST ROUTE (opsional, bisa dihapus)
// ==============================
Route::get('/test', [ArchiveController::class, 'test']);

// ==============================
// USER INFO (autentikasi)
// ==============================
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
