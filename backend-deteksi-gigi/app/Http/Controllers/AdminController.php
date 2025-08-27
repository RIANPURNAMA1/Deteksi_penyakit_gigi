<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index(){
        $consultations = Consultation::with('user') // ikut load data user
        ->latest() // urutkan berdasarkan created_at DESC
        ->get();
        return response()->json($consultations);
    }
}
