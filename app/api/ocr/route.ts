import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const authResult = await requireAuth();
        if (!authResult.ok) return authResult.response;

        const ip = getClientIp(request);
        if (!rateLimit(`ocr:${authResult.auth.user_name || ip}`, 20, 60 * 60 * 1000)) {
            return rateLimitResponse();
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File terlalu besar (maks 5MB)' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_VISION_API_KEY?.trim();
        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        'Google Vision API Key belum dikonfigurasi. Tambahkan GOOGLE_VISION_API_KEY di file .env.local lalu restart npm run dev.',
                },
                { status: 501 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString('base64');

        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requests: [
                    {
                        image: {
                            content: base64Image,
                        },
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                    },
                ],
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            const errMsg = data.error?.message || 'Google Vision API error';
            return NextResponse.json({ error: errMsg }, { status: response.status || 500 });
        }

        const text = data.responses?.[0]?.fullTextAnnotation?.text || '';
        const annotations = data.responses?.[0]?.textAnnotations || [];
        return NextResponse.json({ text, annotations });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'OCR failed';
        console.error('[API][ocr] error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
