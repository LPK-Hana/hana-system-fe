import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Load .env.local
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const apiKey = process.env.GOOGLE_VISION_API_KEY;
if (!apiKey) {
  console.error('GOOGLE_VISION_API_KEY missing');
  process.exit(1);
}

const samples = [
  'app/admin-dashboard/contoh-data/tumbal-kk/cuntoh.png',
  'app/admin-dashboard/contoh-data/tumbal-kk/testkk2.png',
  'app/admin-dashboard/contoh-data/tumbal-kk/testkk3.png',
];

async function visionOcr(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  const base64Image = buffer.toString('base64');
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ image: { content: base64Image }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Vision API error');
  return {
    text: data.responses?.[0]?.fullTextAnnotation?.text || '',
    annotations: data.responses?.[0]?.textAnnotations || [],
  };
}

async function main() {
  const outDir = path.join(root, 'scripts', 'ocr-output');
  fs.mkdirSync(outDir, { recursive: true });

  for (const rel of samples) {
    const imagePath = path.join(root, rel);
    const name = path.basename(rel, path.extname(rel));
    console.log(`\n========== ${name} ==========`);
    const { text, annotations } = await visionOcr(imagePath);
    fs.writeFileSync(path.join(outDir, `${name}-raw.txt`), text, 'utf8');
    fs.writeFileSync(
      path.join(outDir, `${name}-annotations.json`),
      JSON.stringify(annotations.slice(0, 5), null, 2),
      'utf8',
    );
    console.log('RAW OCR (first 2500 chars):');
    console.log(text.slice(0, 2500));
    console.log(`\n... saved to scripts/ocr-output/${name}-raw.txt (${text.length} chars, ${annotations.length} annotations)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
