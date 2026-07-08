import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getUploadStorageReport } from '@/lib/file-storage-server';

/**
 * GET /api/storage-status
 * Cek apakah UPLOAD_ROOT sudah benar & folder bisa ditulis (admin only).
 */
export async function GET() {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  const report = getUploadStorageReport();

  return NextResponse.json(
    {
      status: 200,
      message: report.warning ?? 'Penyimpanan file OK',
      data: report,
    },
    { status: 200 },
  );
}
