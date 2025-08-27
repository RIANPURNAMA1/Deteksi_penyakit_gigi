<?php
// database/migrations/xxxx_xx_xx_create_consultations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateConsultationsTable extends Migration
{
    public function up()
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // relasi ke user
            $table->integer('age');
            $table->string('gender');
            $table->text('address')->nullable(); // alamat pasien
            $table->text('description')->nullable();
            $table->string('diagnosis_pdf')->nullable();
            $table->string('diagnosis')->nullable();
            $table->text('doctor_notes')->nullable(); // keterangan dari dokter
            $table->text('treatment_recommendation')->nullable(); // rekomendasi perawatan
            $table->date('appointment_date')->nullable(); // tanggal kunjungan puskesmas
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('consultations');
    }
}
