<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'diagnosis',
        'confidence',
        'image_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
