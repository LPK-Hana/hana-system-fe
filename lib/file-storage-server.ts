import 'server-only';

import fs from 'fs';
import path from 'path';
import {
  ALLOWED_UPLOAD_FOLDERS,
  isSensitiveFolder,
  SENSITIVE_UPLOAD_FOLDERS,
} from '@/lib/file-storage';

const PRIVATE_FOLDERS = ['ktp', 'kk', 'hasil_mcu', 'ijazah', 'akte_kelahiran', 'sertifikat'] as const;
const PUBLIC_FOLDERS = ['foto', 'misc'] as const;

export { ALLOWED_UPLOAD_FOLDERS, SENSITIVE_UPLOAD_FOLDERS };

/**
 * Root penyimpanan file di server.
 * Di Hostinger: arahkan ke folder persisten di luar direktori deploy.
 */
export function getStorageRoot(): string {
  return process.env.UPLOAD_ROOT?.trim() || process.cwd();
}

export function isPersistentStorageConfigured(): boolean {
  return Boolean(process.env.UPLOAD_ROOT?.trim());
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getUploadBaseDir(folder: string): string {
  const root = getStorageRoot();
  if (isSensitiveFolder(folder)) {
    return path.join(root, 'uploads', 'private', folder);
  }
  return path.join(root, 'public', 'static', folder);
}

export function getLegacyPublicPath(folder: string, filename: string): string {
  return path.join(getStorageRoot(), 'public', 'static', folder, filename);
}

export function getLegacyGoUploadPath(folder: string, filename: string): string {
  const subdir = folder === 'foto' ? 'photo' : folder;
  return path.join(getStorageRoot(), 'uploads', subdir, filename);
}

export function getPrivateFilePath(folder: string, filename: string): string {
  return path.join(getUploadBaseDir(folder), filename);
}

export function getProjectLegacyPaths(folder: string, filename: string): string[] {
  const cwd = process.cwd();
  const goSubdir = folder === 'foto' ? 'photo' : folder;
  return [
    path.join(cwd, 'uploads', 'private', folder, filename),
    path.join(cwd, 'public', 'static', folder, filename),
    path.join(cwd, 'uploads', goSubdir, filename),
    path.join(cwd, '..', 'hana_app_backend', 'uploads', goSubdir, filename),
  ];
}

export function ensureUploadDirs(): void {
  for (const folder of PRIVATE_FOLDERS) {
    fs.mkdirSync(getUploadBaseDir(folder), { recursive: true });
  }
  for (const folder of PUBLIC_FOLDERS) {
    fs.mkdirSync(getUploadBaseDir(folder), { recursive: true });
  }
}

function countFilesInDir(dir: string): number {
  try {
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter((name) => {
      try {
        return fs.statSync(path.join(dir, name)).isFile();
      } catch {
        return false;
      }
    }).length;
  } catch {
    return 0;
  }
}

function isDirWritable(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, `.write-test-${process.pid}`);
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

export type UploadFolderReport = {
  folder: string;
  path: string;
  fileCount: number;
  writable: boolean;
};

export function getUploadStorageReport() {
  const root = getStorageRoot();
  const persistent = isPersistentStorageConfigured();
  const folders: UploadFolderReport[] = [];

  for (const folder of [...PRIVATE_FOLDERS, ...PUBLIC_FOLDERS]) {
    const dir = getUploadBaseDir(folder);
    folders.push({
      folder,
      path: dir,
      fileCount: countFilesInDir(dir),
      writable: isDirWritable(dir),
    });
  }

  return {
    storageRoot: root,
    persistent,
    production: isProductionEnv(),
    warning: !persistent && isProductionEnv()
      ? 'UPLOAD_ROOT belum diset — file akan disimpan di folder deploy dan bisa hilang saat redeploy.'
      : null,
    folders,
    totalFiles: folders.reduce((sum, f) => sum + f.fileCount, 0),
  };
}

const IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

export function getAlternateFilenames(filename: string): string[] {
  const ext = path.extname(filename).toLowerCase();
  const base = filename.slice(0, filename.length - ext.length);
  if (!IMAGE_EXTENSIONS.includes(ext)) return [filename];
  const variants = new Set<string>([filename]);
  for (const altExt of IMAGE_EXTENSIONS) {
    variants.add(`${base}${altExt}`);
  }
  return [...variants];
}

export function resolveStoredFilePath(folder: string, filename: string): string | null {
  const candidates = getAlternateFilenames(filename);

  for (const name of candidates) {
    const paths = [
      getPrivateFilePath(folder, name),
      getLegacyPublicPath(folder, name),
      getLegacyGoUploadPath(folder, name),
      ...getProjectLegacyPaths(folder, name),
    ];

    for (const filePath of paths) {
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          return filePath;
        }
      } catch {
        // lanjut ke kandidat berikutnya
      }
    }
  }

  return null;
}
