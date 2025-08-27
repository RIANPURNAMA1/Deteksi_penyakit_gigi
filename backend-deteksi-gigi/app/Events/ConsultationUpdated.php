<?php

namespace App\Events;

use App\Models\Consultation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ConsultationUpdated implements ShouldBroadcast
{
    use SerializesModels;

    public $consultation;
    public $message;

    public function __construct(Consultation $consultation, string $message)
    {
        $this->consultation = $consultation;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->consultation->user_id);
    }
}
