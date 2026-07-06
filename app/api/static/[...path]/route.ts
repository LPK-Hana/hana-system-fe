import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSensitiveFolder } from '@/lib/file-storage';
import { resolveStoredFilePath } from '@/lib/file-storage-server';
import { requireAuth } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new Response('Not Found', { status: 404 });
    }

    const folder = pathSegments[0] || '';
    if (isSensitiveFolder(folder)) {
      return NextResponse.json({ status: 403, message: 'Gunakan /api/files untuk dokumen sensitif' }, { status: 403 });
    }

    const filename = pathSegments.slice(1).join('/');
    if (!filename) {
      return new Response('Not Found', { status: 404 });
    }

    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    let filePath = resolveStoredFilePath(folder, filename);

    const relativePath = path.join(...pathSegments);
    if (relativePath.includes('..') || path.isAbsolute(relativePath)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!filePath) {
      const root = process.env.UPLOAD_ROOT?.trim() || process.cwd();
      const fallbackPath = path.join(root, 'public', 'static', relativePath);
      if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
        filePath = fallbackPath;
      }
    }

    if (!filePath) {
      return new Response('Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new Response('Not Found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[API][static] error:', message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
