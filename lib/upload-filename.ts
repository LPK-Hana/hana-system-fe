/** Hanya A-Z, 0-9, -, _ — sama seperti backend Go lama. */
export function sanitizeNoPesertaForFilename(noPeserta: string): string {
  const cleaned = noPeserta
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  return cleaned || 'UNKNOWN';
}

function sanitizeLabel(label: string): string {
  return label
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40) || 'DOC';
}

export const UPLOAD_NAME_PREFIX = {
  foto: 'Photo3x4',
  ktp: 'KTP',
  kk: 'KK',
  akte_kelahiran: 'AKTE_KELAHIRAN',
  ijazah: 'IJAZAH',
  hasil_mcu: 'HASIL_MCU',
  sertifikat: 'SERTIFIKAT',
} as const;

export type UploadNameFolder = keyof typeof UPLOAD_NAME_PREFIX;

/** Bangun basename file tanpa ekstensi, mis. Photo3x4_JMS05001 */
export function buildUploadBasename(
  folder: UploadNameFolder,
  noPeserta: string,
  options?: { index?: number; label?: string },
): string {
  const id = sanitizeNoPesertaForFilename(noPeserta);
  const prefix = UPLOAD_NAME_PREFIX[folder];

  if (folder === 'sertifikat') {
    const idx = options?.index ?? 0;
    if (options?.label) {
      return `${prefix}_${idx}_${sanitizeLabel(options.label)}_${id}`;
    }
    return `${prefix}_${idx}_${id}`;
  }

  return `${prefix}_${id}`;
}
