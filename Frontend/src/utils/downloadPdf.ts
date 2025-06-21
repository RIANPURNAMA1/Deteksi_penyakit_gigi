// utils/downloadPdf.ts
import jsPDF from "jspdf";

/**
 * Fungsi untuk membuat dan menyimpan PDF diagnosis gigi berbasis AI
 * @param mainDiagnosis Diagnosis utama (label dan confidence)
 * @param resultImageSrc Gambar hasil deteksi (base64 atau URL lokal)
 */
export const downloadDiagnosisAsPDF = (
  mainDiagnosis: { label: string; value: number } | null,
  resultImageSrc: string | null
) => {
  if (!mainDiagnosis || !resultImageSrc) {
    alert("Tidak ada hasil diagnosis atau gambar yang dapat diunduh.");
    return;
  }

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // === HEADER ===
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(0, 102, 204);
    pdf.text("GIGI.ID", pageWidth / 2, 25, { align: "center" });

    pdf.setFontSize(16);
    pdf.text("KLINIK GIGI DIGITAL AI", pageWidth / 2, 35, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(0);
    pdf.text(
      "Jl. Kesehatan No. 10, Bandung | Telp: (022) 1234567",
      pageWidth / 2,
      42,
      { align: "center" }
    );
    pdf.line(margin, 45, pageWidth - margin, 45);

    // === JUDUL LAPORAN ===
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(0);
    pdf.text(
      "SURAT KETERANGAN HASIL PEMERIKSAAN GIGI",
      pageWidth / 2,
      60,
      { align: "center" }
    );

    // === TANGGAL ===
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Tanggal Pemeriksaan: ${dateStr}`, margin, 70);

    // === DIAGNOSIS ===
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Hasil Pemeriksaan Sistem Deteksi AI:", margin, 85);

    const confidenceFixed = Math.min(mainDiagnosis.value * 100, 100).toFixed(2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`• Penyakit Gigi: ${mainDiagnosis.label}`, margin + 8, 95);
    pdf.text(`• Tingkat Keyakinan: ${confidenceFixed}%`, margin + 8, 103);

    // === GAMBAR HASIL DETEKSI ===
    const img = new Image();
    img.src = resultImageSrc;

    img.onload = () => {
      const imgWidth = 170;
      const aspectRatio = img.height / img.width;
      const imgHeight = imgWidth * aspectRatio;
      const imgY = 115;

      pdf.addImage(img, "PNG", margin, imgY, imgWidth, imgHeight);

      // === FOOTER ===
      const footerY = imgY + imgHeight + 15;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(
        "Catatan: Dokumen ini dihasilkan secara otomatis oleh Sistem AI Deteksi Penyakit Gigi.",
        margin,
        footerY
      );

      pdf.save("surat-keterangan-hasil-pemeriksaan-gigi.pdf");
    };

    img.onerror = () => {
      throw new Error("Gagal memuat gambar hasil deteksi.");
    };
  } catch (err: any) {
    alert("Gagal membuat PDF: " + err.message);
  }
};
