import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { isSensitiveFolder, sanitizeFilename } from '@/lib/file-storage';
import { resolveStoredFilePath } from '@/lib/file-storage-server';
import { getAuth, isGuest, isStaff } from '@/lib/api-auth';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.gif': 'image/gif',
};

async function canAccessFile(folder: string, filename: string, auth: NonNullable<Awaited<ReturnType<typeof getAuth>>>): Promise<boolean> {
  if (isStaff(auth) || isGuest(auth)) return true;

  const biodata = await queryOne<{
    ktp: string | null;
    kk: string | null;
    hasil_mcu: string | null;
    ijazah: string | null;
    akte_kelahiran: string | null;
    foto: string | null;
  }>(
    `SELECT ktp, kk, hasil_mcu, ijazah, akte_kelahiran, foto
     FROM tbl_biodata WHERE no_peserta = $1 LIMIT 1`,
    [auth.user_name],
  );

  if (!biodata) return false;

  const columnMap: Record<string, string | null | undefined> = {
    ktp: biodata.ktp,
    kk: biodata.kk,
    hasil_mcu: biodata.hasil_mcu,
    ijazah: biodata.ijazah,
    akte_kelahiran: biodata.akte_kelahiran,
    foto: biodata.foto,
  };

  if (folder === 'sertifikat') {
    const cert = await queryOne<{ sertifikat: string }>(
      `SELECT s.sertifikat FROM tbl_riwayat_sertifikat s
       JOIN tbl_biodata b ON b.id_biodata = s.id_biodata
       WHERE b.no_peserta = $1 AND s.sertifikat = $2 LIMIT 1`,
      [auth.user_name, filename],
    );
    return !!cert;
  }

  return columnMap[folder] === filename;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> },
) {
  try {
    const { folder, filename: rawFilename } = await params;

    if (!isSensitiveFolder(folder)) {
      return new Response('Not Found', { status: 404 });
    }

    const filename = sanitizeFilename(decodeURIComponent(rawFilename));
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ status: 401, message: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await canAccessFile(folder, filename, auth);
    if (!allowed) {
      return NextResponse.json({ status: 403, message: 'Forbidden' }, { status: 403 });
    }

    const filePath = resolveStoredFilePath(folder, filename);
    if (!filePath) {
      return new Response('Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new Response('Not Found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[API][files] error:', message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
