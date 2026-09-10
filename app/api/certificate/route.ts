import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireStaff } from '@/lib/api-auth';

export async function GET() {
    try {
        const authResult = await requireStaff();
        if (!authResult.ok) return authResult.response;

        const filePath = path.join(
            process.cwd(),
            'app',
            'admin-dashboard',
            'progress-belajar',
            'certificate-form',
            'N4.html'
        );

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Error reading certificate HTML:', error);
        return new NextResponse('Certificate template not found', { status: 404 });
    }
}
