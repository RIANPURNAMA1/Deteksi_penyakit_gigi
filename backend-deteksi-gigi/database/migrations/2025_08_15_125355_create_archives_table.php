<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('archives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('diagnosis');
            $table->decimal('confidence', 5, 2);
            $table->string('image_url')->nullable(); // path file gambar
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archives');
    }
};
