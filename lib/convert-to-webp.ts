/** Kualitas WebP (0–1), setara quality 80 di sharp. */
export const WEBP_QUALITY = 0.8;

const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;

export function isImageUpload(file: File): boolean {
  if (file.type === 'application/pdf') return false;
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXT_RE.test(file.name);
}

/**
 * Konversi gambar ke WebP di browser (Canvas API).
 * Tidak butuh sharp/libvips — aman di Hostinger Linux.
 * PDF dikembalikan apa adanya.
 */
export async function convertImageToWebp(file: File, quality = WEBP_QUALITY): Promise<File> {
  if (!isImageUpload(file)) return file;
  if (file.type === 'image/webp' || /\.webp$/i.test(file.name)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas tidak tersedia');

      ctx.drawImage(bitmap, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Konversi WebP gagal'))),
          'image/webp',
          quality,
        );
      });

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'upload';
      return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
    } finally {
      bitmap.close();
    }
  } catch {
    // HEIC / format tidak didukung createImageBitmap di beberapa HP — kirim file asli
    return file;
  }
}

/** Siapkan file sebelum dikirim ke FormData — gambar jadi WebP, PDF tetap PDF. */
export async function prepareUploadFile(file: File): Promise<File> {
  return convertImageToWebp(file);
}
