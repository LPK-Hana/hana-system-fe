import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { ALLOWED_UPLOAD_FOLDERS, buildFileUrl } from '@/lib/file-storage';
import {
  buildUploadBasename,
  sanitizeNoPesertaForFilename,
  UPLOAD_NAME_PREFIX,
  type UploadNameFolder,
} from '@/lib/upload-filename';

/**
 * Endpoint standar untuk mengunggah file satuan (jika dibutuhkan di luar payload form utama).
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;
    const auth = authResult.auth;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'misc';

    if (!ALLOWED_UPLOAD_FOLDERS.has(folder)) {
      return NextResponse.json({ status: 400, message: 'Folder tidak diizinkan' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ status: 400, message: 'File tidak ditemukan' }, { status: 400 });
    }

    const { processAndSaveFile } = await import('@/lib/uploadHelper');

    const noPeserta = (formData.get('no_peserta') as string) || '';
    const noSlug = sanitizeNoPesertaForFilename(noPeserta);
    let basename: string | undefined;
    if (noSlug) {
      if (folder in UPLOAD_NAME_PREFIX) {
        basename = buildUploadBasename(folder as UploadNameFolder, noSlug);
      } else {
        basename = `${folder.toUpperCase()}_${noSlug}`;
      }
    }

    const filename = await processAndSaveFile(file, folder, basename);

    return NextResponse.json({
      status: 200,
      message: 'Upload berhasil',
      data: {
        filename,
        url: buildFileUrl(folder, filename),
      }
    }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload gagal';
    console.error('[API][upload] error:', message);
    return NextResponse.json({ status: 500, message: 'Gagal mengunggah file: ' + message }, { status: 500 });
  }
}
