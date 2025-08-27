<?php
// app/Mail/ConsultationResultMail.php
namespace App\Mail;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ConsultationResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public $consultation;

    public function __construct(Consultation $consultation)
    {
        $this->consultation = $consultation;
    }

    public function build()
    {
        return $this->subject('Hasil Konsultasi Anda')
                    ->view('emails.consultation_result')
                    ->with([
                        'consultation' => $this->consultation
                    ]);
    }
}
