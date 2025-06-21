<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class MidtransController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except('handleNotification');
    }

    public function createTransaction(Request $request)
    {
        $user = auth()->user();

        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        $orderId = 'ORDER-' . uniqid();

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => 29000,
            ],
            'customer_details' => [
                'first_name' => $user->name ?? 'User',
                'email' => $user->email ?? 'user@example.com',
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        return response()->json([
            'token' => $snapToken,
            'order_id' => $orderId,
        ]);
    }

    public function handleNotification(Request $request)
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');

        $notif = new Notification();

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraud = $notif->fraud_status;

        Log::info('Midtrans Notification', [
            'transaction_status' => $transaction,
            'order_id' => $orderId,
            'payment_type' => $type,
            'fraud_status' => $fraud,
        ]);

        if ($transaction === 'capture' || $transaction === 'settlement') {
            $email = $notif->customer_details->email ?? null;
            if ($email) {
                $user = User::where('email', $email)->first();
                if ($user) {
                    $user->is_premium = true;
                    $user->save();
                    Log::info("User {$user->email} upgraded to premium.");
                }
            }
        }

        return response()->json(['message' => 'Notification processed']);
    }
}
