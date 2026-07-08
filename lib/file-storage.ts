/** Folder dokumen sensitif — disimpan di luar public/ dan diakses via /api/files */
export const SENSITIVE_UPLOAD_FOLDERS = new Set([
  'ktp',
  'kk',
  'hasil_mcu',
  'ijazah',
  'akte_kelahiran',
  'sertifikat',
]);

export const ALLOWED_UPLOAD_FOLDERS = new Set([
  'foto',
  'misc',
  ...SENSITIVE_UPLOAD_FOLDERS,
]);

export function isSensitiveFolder(folder: string): boolean {
  return SENSITIVE_UPLOAD_FOLDERS.has(folder);
}

export function buildFileUrl(folder: string, filename: string): string {
  if (!filename) return '';
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? '').replace(/\/$/, '');
  if (filename.startsWith('http')) return filename;
  if (isSensitiveFolder(folder)) {
    // BASE_URL sudah berisi prefix /api — jangan tambah /api lagi
    return `${base}/files/${folder}/${encodeURIComponent(filename)}`;
  }
  return `${base}/static/${folder}/${filename}`;
}

/** Map field key form admin → folder penyimpanan */
export function getDocFolderFromKey(key: string): string {
  switch (key) {
    case 'dokumen_ktp': return 'ktp';
    case 'dokumen_kk': return 'kk';
    case 'dokumen_akte': return 'akte_kelahiran';
    case 'dokumen_ijazah': return 'ijazah';
    case 'mcu_pdf': return 'hasil_mcu';
    case 'sertifikat': return 'sertifikat';
    case 'foto': return 'foto';
    default: return key;
  }
}

export function buildDocFileUrl(key: string, filename: string): string {
  return buildFileUrl(getDocFolderFromKey(key), filename);
}

export function sanitizeFilename(filename: string): string {
  const base = filename.replace(/^.*[/\\]/, '');
  if (base.includes('..') || base.includes('/') || base.includes('\\')) {
    throw new Error('Invalid filename');
  }
  return base;
}
