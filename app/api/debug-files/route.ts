import { NextResponse } from 'next/server';
import { getUploadStorageReport } from '@/lib/file-storage-server';
import { requireAdmin } from '@/lib/api-auth';

/** @deprecated Gunakan /api/storage-status */
export async function GET() {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  const report = getUploadStorageReport();

  return NextResponse.json(
    {
      status: 200,
      deprecated: 'Gunakan /api/storage-status',
      ...report,
    },
    { status: 200 },
  );
}
