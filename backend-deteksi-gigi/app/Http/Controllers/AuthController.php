<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use Carbon\Carbon;

class AuthController extends Controller
{
    // Register user baru + generate OTP
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email',
            'password' => 'required|min:6',
            'role'     => 'in:admin,dokter,user'
        ]);

        $existingUser = User::where('email', $validated['email'])->first();

        if ($existingUser) {
            if ($existingUser->email_verified_at) {
                return response()->json(['message' => 'Email sudah terdaftar dan terverifikasi.'], 422);
            } else {
                // update user lama & kirim ulang OTP
                $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

                $existingUser->update([
                    'name'           => $validated['name'],
                    'password'       => bcrypt($validated['password']),
                    'role'           => $validated['role'] ?? 'user',
                    'otp_code'       => $otp,
                    'otp_expires_at' => Carbon::now()->addMinutes(10),
                ]);

                Mail::raw("Kode OTP verifikasi Anda adalah: $otp (berlaku 10 menit).", function ($message) use ($existingUser) {
                    $message->to($existingUser->email)
                        ->subject('Verifikasi Email - Sistem Deteksi Gigi');
                });

                return response()->json([
                    'message' => 'Akun sudah ada tapi belum diverifikasi. OTP dikirim ulang ke email Anda.',
                    'user_id' => $existingUser->id
                ], 200);
            }
        }

        // Email baru → buat user baru
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => bcrypt($validated['password']),
            'role'              => $validated['role'] ?? 'user',
            'otp_code'          => $otp,
            'otp_expires_at'    => Carbon::now()->addMinutes(10),
            'email_verified_at' => null
        ]);

        Mail::raw("Kode OTP verifikasi Anda adalah: $otp (berlaku 10 menit).", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Verifikasi Email - Sistem Deteksi Gigi');
        });

        return response()->json([
            'message' => 'Pendaftaran berhasil. Silakan cek email untuk verifikasi OTP.',
            'user_id' => $user->id
        ], 201);
    }

    // Resend OTP
    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) return response()->json(['message' => 'User tidak ditemukan'], 404);

        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->otp_code = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        Mail::raw("Kode OTP baru Anda adalah: $otp (berlaku 10 menit).", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Kode OTP Baru - Sistem Deteksi Gigi');
        });

        return response()->json(['message' => 'OTP baru telah dikirim ke email Anda'], 200);
    }

    // Verifikasi OTP
    public function verifyOtp(Request $request)
    {
        $request->validate(['email' => 'required|email', 'otp' => 'required|numeric']);
        $user = User::where('email', $request->email)->first();

        if (!$user) return response()->json(['message' => 'User tidak ditemukan'], 404);

        // Cek expired

        if (!$user->otp_expires_at || Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Kode OTP expired. Silakan minta OTP baru.'], 400);
        }


        // Cek OTP salah
        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Kode OTP salah. Silakan coba lagi.'], 400);
        }

        // OTP valid
        $user->email_verified_at = Carbon::now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'       => 'Email berhasil diverifikasi',
            'access_token'  => $token,
            'token_type'    => 'Bearer',
            'user'          => $user
        ]);
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->validate(['email' => 'required|email', 'password' => 'required']);

        if (!Auth::attempt($credentials)) return response()->json(['message' => 'Email atau password salah'], 401);

        $user = Auth::user();
        if (!$user->email_verified_at) return response()->json(['message' => 'Silakan verifikasi email terlebih dahulu'], 403);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
}
