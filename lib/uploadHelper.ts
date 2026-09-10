import fs from 'fs';
import path from 'path';
import { ALLOWED_UPLOAD_FOLDERS, ensureUploadDirs, getUploadBaseDir } from '@/lib/file-storage-server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
const ALLOWED_DOC_TYPES = new Set(['application/pdf']);

const IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];
const DOC_EXTENSIONS = ['.pdf', ...IMAGE_EXTENSIONS];

function removeExistingVariants(baseDir: string, filenameBase: string, isImage: boolean): void {
  const exts = isImage ? IMAGE_EXTENSIONS : DOC_EXTENSIONS;
  for (const ext of exts) {
    const filepath = path.join(baseDir, `${filenameBase}${ext}`);
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch {
      // abaikan jika gagal hapus file lama
    }
  }
}

/**
 * Memproses file yang diupload.
 * Gambar disimpan sebagai .webp (dikonversi di browser sebelum upload).
 * PDF tetap PDF.
 *
 * @param customFilename basename tanpa ekstensi, mis. Photo3x4_JMS05001
 */
export async function processAndSaveFile(
  file: File,
  subFolder: string,
  customFilename?: string,
): Promise<string> {
  if (!ALLOWED_UPLOAD_FOLDERS.has(subFolder)) {
    throw new Error('Folder upload tidak diizinkan');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ukuran file melebihi batas 10MB');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  ensureUploadDirs();
  const baseDir = getUploadBaseDir(subFolder);

  const originalName = file.name;
  const ext = path.extname(originalName).toLowerCase();

  const isImage = ALLOWED_IMAGE_TYPES.has(file.type) ||
    IMAGE_EXTENSIONS.includes(ext);
  const isPdf = ALLOWED_DOC_TYPES.has(file.type) || ext === '.pdf';

  if (!isImage && !isPdf) {
    throw new Error('Tipe file tidak diizinkan');
  }

  let filenameBase = '';
  if (customFilename) {
    filenameBase = customFilename.replace(/[^a-zA-Z0-9_\-]/g, '_');
  } else {
    filenameBase = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  }

  removeExistingVariants(baseDir, filenameBase, isImage);

  if (isImage) {
    const filename = `${filenameBase}.webp`;
    const filepath = path.join(baseDir, filename);
    fs.writeFileSync(filepath, buffer);
    return filename;
  }

  const filename = `${filenameBase}${ext}`;
  const filepath = path.join(baseDir, filename);
  fs.writeFileSync(filepath, buffer);
  return filename;
}
