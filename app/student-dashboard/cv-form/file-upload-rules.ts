/** Ekstensi yang diizinkan untuk dokumen pendukung (bukan foto profil). */
export const DOC_ACCEPT_INPUT = '.pdf,.png,.jpeg,.jpg';

/** Foto 3×4: hanya gambar JPG/JPEG/PNG. */
export const PHOTO_ACCEPT_INPUT = '.jpg,.jpeg,.png';

const DOC_EXT_RE = /\.(pdf|png|jpe?g)$/i;
const PHOTO_EXT_RE = /\.(png|jpe?g)$/i;

export function isAllowedDocUpload(file: File): boolean {
  return DOC_EXT_RE.test(file.name);
}

export function isAllowedPhotoUpload(file: File): boolean {
  return PHOTO_EXT_RE.test(file.name);
}

/** Teks untuk atribut `title` (tooltip) — dokumen pendukung & lampiran sertifikat. */
export const TOOLTIP_DOC_UPLOAD =
  'PDF, JPG, JPEG, atau PNG. Gambar otomatis dikompres ke WebP saat upload.';

/** Teks untuk atribut `title` (tooltip) — foto 3×4. */
export const TOOLTIP_PHOTO_UPLOAD =
  'JPG, JPEG, atau PNG. Otomatis dikonversi ke WebP saat upload.';
