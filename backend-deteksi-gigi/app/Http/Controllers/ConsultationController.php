<?php

namespace App\Http\Controllers;

use App\Events\ConsultationUpdated;
use App\Mail\ConsultationResultMail;
use Illuminate\Http\Request;
use App\Models\Consultation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ConsultationController extends Controller
{
    // Simpan data konsultasi user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'age' => 'required|integer|min:0',
            'gender' => 'required|string|in:Laki-laki,Perempuan',
            'address' => 'required|string',
            'description' => 'nullable|string',
            'diagnosis_pdf' => 'required|file|mimes:pdf|max:8120', // max 8MB
            'diagnosis' => 'required|string',
        ]);

        $file = $request->file('diagnosis_pdf');

        // Tentukan folder tujuan di public
        $destinationPath = public_path('diagnosis_pdfs');
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        $filename = uniqid() . '_' . $file->getClientOriginalName();
        $file->move($destinationPath, $filename);

        $pdfPath = 'diagnosis_pdfs/' . $filename;

        $consultation = Consultation::create([
            'user_id' => Auth::id(),
            'age' => $validated['age'],
            'gender' => $validated['gender'],
            'address' => $validated['address'],
            'description' => $validated['description'],
            'diagnosis_pdf' => $pdfPath,
            'diagnosis' => $validated['diagnosis'],
            'doctor_notes' => null,
        ]);

        return response()->json([
            'message' => 'Konsultasi berhasil dikirim',
            'consultation' => $consultation,
        ]);
    }

    public function sendEmail($id)
    {
        $consultation = Consultation::with('user')->findOrFail($id);

        if (!$consultation->user || !$consultation->user->email) {
            return response()->json(['message' => 'User tidak memiliki email'], 400);
        }

        // Kirim email menggunakan Mailable
        Mail::to($consultation->user->email)->send(new ConsultationResultMail($consultation));

        return response()->json([
            'message' => 'Email berhasil dikirim'
        ]);
    }


    // Tampilkan semua konsultasi milik user login
    public function index()
    {
        $consultations = Consultation::with('user')
            ->latest()
            ->get();

        return response()->json($consultations);
    }

    public function userAll()
    {
        // Ambil semua konsultasi milik user yang sedang login
        $consultations = Consultation::with('user')
            ->where('user_id', Auth::id()) // filter berdasarkan user login
            ->latest()
            ->get();

        return response()->json($consultations);
    }

    // Simpan catatan dokter
    public function saveDoctorNote(Request $request, $id)
    {
        $request->validate([
            'doctor_notes' => 'nullable|string',
            'treatment_recommendation' => 'nullable|string',
            'appointment_date' => 'nullable|date',
        ]);

        $consultation = Consultation::findOrFail($id);
        $consultation->doctor_notes = $request->doctor_notes;
        $consultation->treatment_recommendation = $request->treatment_recommendation;
        $consultation->appointment_date = $request->appointment_date;
        $consultation->save();
        // Kirim notifikasi real-time ke user


        return response()->json([
            'message' => 'Catatan dokter berhasil disimpan',
            'consultation' => $consultation,
        ]);
    }

    // Hapus catatan dokter
    public function deleteDoctorNote($id)
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->doctor_notes = null;
        $consultation->treatment_recommendation = null;
        $consultation->appointment_date = null;
        $consultation->save();

        return response()->json([
            'message' => 'Catatan dokter berhasil dihapus',
            'consultation' => $consultation,
        ]);
    }
    public function destroy($id)
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->delete();

        return response()->json([
            'message' => 'Pasien berhasil dihapus'
        ], 200);
    }
}
