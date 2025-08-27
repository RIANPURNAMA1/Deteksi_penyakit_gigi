<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hasil Konsultasi</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header dengan logo -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <span style="font-size: 28px; color: #3b82f6;">🦷</span>
            <span style="font-size: 22px; font-weight: 800; color: #1e3a8a;">GIGI</span><span style="font-size: 22px; font-weight: 800; color: black;">.ID</span>
        </div>

        <h2 style="color: #1e3a8a;">Halo {{ $consultation->user->name }}</h2>

        <p style="color: #374151;">Berikut hasil konsultasi Anda:</p>

        <ul style="line-height: 1.8; color: #111827;">
            <li><strong>Keluhan:</strong> {{ $consultation->description }}</li>
            <li><strong>Diagnosis:</strong> {{ $consultation->diagnosis ?? '-' }}</li>
            <li><strong>Catatan Dokter:</strong> {{ $consultation->doctor_notes ?? '-' }}</li>
            <li><strong>Rekomendasi:</strong> {{ $consultation->treatment_recommendation ?? '-' }}</li>
            <li><strong>Jadwal Kunjungan:</strong> {{ $consultation->appointment_date ?? '-' }}</li>
        </ul>

        @if($consultation->diagnosis_pdf)
            <p style="margin-top: 20px;">
                Silakan unduh laporan PDF di: 
                <a href="{{ url($consultation->diagnosis_pdf) }}" 
                   style="color: #3b82f6; text-decoration: none; font-weight: bold;">
                   📄 Download PDF
                </a>
            </p>
        @endif

        <!-- Footer -->
        <div style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            &copy; {{ date('Y') }} GIGI.ID - Semua Hak Dilindungi
        </div>
    </div>
</body>
</html>
