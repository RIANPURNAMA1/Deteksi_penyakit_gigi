<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultation extends Model
{
    // Jika Laravel versi terbaru, bisa pakai HasFactory jika perlu:
    // use HasFactory;

    protected $fillable = [
        'user_id',
        'age',
        'gender',
        'address',
        'description',
        'diagnosis_pdf',
        'diagnosis',
        'doctor_notes',
        'treatment_recommendation',
        'appointment_date',
    ];  

    protected $casts = [
        'referral' => 'array',  // otomatis cast ke array
    ];
    // Tambahkan 'diagnosis_pdf_url' ke JSON otomatis
    protected $appends = ['diagnosis_pdf_url'];

    /**
     * Relasi ke User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor untuk URL lengkap file diagnosis PDF
     */
    public function getDiagnosisPdfUrlAttribute()
    {
        if ($this->diagnosis_pdf) {
            return asset($this->diagnosis_pdf);  // langsung dari folder public
        }
        return null;
    }
}
