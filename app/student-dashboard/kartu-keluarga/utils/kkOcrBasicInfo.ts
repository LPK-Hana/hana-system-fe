export interface OcrWord {
  text: string;
  minX: number;
  maxX: number;
  centerY: number;
  deskewedMinX: number;
  deskewedMaxX: number;
  deskewedCenterX: number;
  deskewedCenterY: number;
}

export interface KkBasicInfoFields {
  kepalaKeluarga: string;
  alamat: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kabKota: string;
  kodePos: string;
  provinsi: string;
}

type BasicField = keyof KkBasicInfoFields;

const SCAN_ROW_MAP: [BasicField, BasicField][] = [
  ['kepalaKeluarga', 'kelurahan'],
  ['alamat', 'kecamatan'],
  ['rtRw', 'kabKota'],
  ['kodePos', 'provinsi'],
];

const FORM_ROW_MAP: [BasicField, BasicField][] = [
  ['kepalaKeluarga', 'kecamatan'],
  ['alamat', 'kabKota'],
  ['rtRw', 'kodePos'],
  ['kelurahan', 'provinsi'],
];

const ID_LABEL_PATTERNS: { field: BasicField; pattern: RegExp }[] = [
  { field: 'kepalaKeluarga', pattern: /NAMA\s*KEPALA\s*KELUARGA/i },
  { field: 'alamat', pattern: /\bALAMAT\b/i },
  { field: 'rtRw', pattern: /\bRT\s*\/\s*RW\b|\bRT\s+RW\b/i },
  { field: 'kelurahan', pattern: /DESA\s*\/\s*KELURAHAN|\bDESA\b|\bKELURAHAN\b/i },
  { field: 'kecamatan', pattern: /\bKECAMATAN\b/i },
  { field: 'kabKota', pattern: /KABUPATEN\s*\/\s*KOTA|\bKABUPATEN\b/i },
  { field: 'kodePos', pattern: /KODE\s*POS/i },
  { field: 'provinsi', pattern: /\bPROVINSI\b/i },
];

const ALL_LABEL_STOP = new RegExp(
  ID_LABEL_PATTERNS.map(({ pattern }) => pattern.source).join('|'),
  'i',
);

const INDONESIAN_PROVINCES =
  /JAWA\s+BARAT|JAWA\s+TENGAH|JAWA\s+TIMUR|DKI\s+JAKARTA|DI\s+YOGYAKARTA|BANTEN|BALI|SUMATERA\s+UTARA|SUMATERA\s+BARAT|SUMATERA\s+SELATAN|RIAU|KEPULAUAN\s+RIAU|JAMBI|BENGKULU|LAMPUNG|BANGKA\s+BELITUNG|KALIMANTAN\s+BARAT|KALIMANTAN\s+TENGAH|KALIMANTAN\s+SELATAN|KALIMANTAN\s+TIMUR|KALIMANTAN\s+UTARA|SULAWESI\s+UTARA|SULAWESI\s+TENGAH|SULAWESI\s+SELATAN|SULAWESI\s+TENGGARA|GORONTALO|SULAWESI\s+BARAT|NUSA\s+TENGGARA\s+BARAT|NUSA\s+TENGGARA\s+TIMUR|MALUKU|MALUKU\s+UTARA|PAPUA|PAPUA\s+BARAT|ACEH/i;

function emptyBasicInfo(): KkBasicInfoFields {
  return {
    kepalaKeluarga: '',
    alamat: '',
    rtRw: '',
    kelurahan: '',
    kecamatan: '',
    kabKota: '',
    kodePos: '',
    provinsi: '',
  };
}

function joinWords(words: OcrWord[]): string {
  const sorted = [...words].sort((a, b) => a.deskewedMinX - b.deskewedMinX);
  let lineStr = '';
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      lineStr += sorted[i].text;
    } else {
      const gap = sorted[i].deskewedMinX - sorted[i - 1].deskewedMaxX;
      lineStr += gap > 20 ? '   ' : ' ';
      lineStr += sorted[i].text;
    }
  }
  return lineStr.trim();
}

function groupWordsIntoRows(words: OcrWord[], yTolerance = 14): OcrWord[][] {
  const sorted = [...words].sort((a, b) => a.deskewedCenterY - b.deskewedCenterY);
  const rows: OcrWord[][] = [];
  let current: OcrWord[] = [];

  for (const item of sorted) {
    if (current.length === 0) {
      current.push(item);
      continue;
    }
    const avgY = current.reduce((sum, w) => sum + w.deskewedCenterY, 0) / current.length;
    if (Math.abs(item.deskewedCenterY - avgY) < yTolerance) {
      current.push(item);
    } else {
      rows.push(current);
      current = [item];
    }
  }
  if (current.length > 0) rows.push(current);
  return rows;
}

function getPageWidth(words: OcrWord[]): number {
  if (words.length === 0) return 1600;
  return Math.max(...words.map((w) => w.deskewedMaxX));
}

function splitRowByPageCenter(row: OcrWord[], splitX: number): { left: OcrWord[]; right: OcrWord[] } {
  const left: OcrWord[] = [];
  const right: OcrWord[] = [];
  for (const word of row) {
    if (word.deskewedCenterX < splitX) left.push(word);
    else right.push(word);
  }
  return { left, right };
}

function cleanValue(raw: string): string {
  let value = raw
    .replace(/^[:.\-\s/]+/, '')
    .replace(/\s*[:/]\s*[:/]+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const stopIdx = value.search(ALL_LABEL_STOP);
  if (stopIdx > 0) value = value.substring(0, stopIdx).trim();

  value = value
    .replace(/^KEPALA\s*KELUARGA\s*:\s*[\w\s,.']+\s*/i, '')
    .replace(/^(?:\/\s*)?(?:DESA|KELURAHAN|KECAMATAN|KABUPATEN|KOTA|PROVINSI)\s*:+\s*/gi, '')
    .replace(/^[:.\-\s/]+/, '')
    .trim();

  return value;
}

function extractValueFromSideText(text: string): string {
  if (!text) return '';
  const lastColon = text.lastIndexOf(':');
  const raw = lastColon >= 0 ? text.substring(lastColon + 1) : text;
  return cleanValue(raw);
}

function extractValueFromSide(words: OcrWord[]): string {
  return extractValueFromSideText(joinWords(words));
}

function extractRtRw(text: string): string {
  const match = text.match(/\b(\d{2,3}\s*\/\s*\d{2,3})\b/);
  return match ? match[1].replace(/\s+/g, '') : '';
}

function extractKodePos(text: string): string {
  const match = text.match(/\b(\d{5})\b/);
  return match ? match[1] : '';
}

function assignFieldValue(fields: KkBasicInfoFields, field: BasicField, value: string, rawText: string) {
  if (!value && field !== 'rtRw' && field !== 'kodePos') return;

  if (field === 'rtRw') {
    const rtRw = extractRtRw(rawText) || extractRtRw(value);
    if (rtRw) fields.rtRw = rtRw;
    return;
  }

  if (field === 'kodePos') {
    const kodePos = extractKodePos(rawText) || extractKodePos(value);
    if (kodePos) fields.kodePos = kodePos;
    return;
  }

  if (value) fields[field] = value;
}

function isHeaderNoise(text: string): boolean {
  return /KARTU\s*KELUARGA|戸籍謄本|REPUBLIK\s*INDONESIA|No\.?\s*\d{16}|^\d{16}$/i.test(text);
}

function detectLayout(rows: { left: string; right: string }[]): [BasicField, BasicField][] {
  const leftJoined = rows.map((r) => r.left).join(' ');
  const rightJoined = rows.map((r) => r.right).join(' ');

  const kodePosOnLeft = /KODE\s*POS/i.test(leftJoined);
  const desaOnRight = /DESA|KELURAHAN/i.test(rightJoined);
  const desaOnLeft = /DESA|KELURAHAN/i.test(leftJoined);
  const kodePosOnRight = /KODE\s*POS/i.test(rightJoined);

  if (kodePosOnLeft && desaOnRight) return SCAN_ROW_MAP;
  if (desaOnLeft && kodePosOnRight) return FORM_ROW_MAP;
  return SCAN_ROW_MAP;
}

function findTableStartY(words: OcrWord[]): number {
  const nikWord = words.find((w) => /^\d{16}$/.test(w.text));
  if (nikWord) return nikWord.deskewedCenterY - 40;

  const tableHeader = words.find(
    (w) => /NIK|NAMA\s*LENGKAP|氏名|登録番号/i.test(w.text) && w.deskewedCenterY > 120,
  );
  if (tableHeader) return tableHeader.deskewedCenterY - 20;

  const ys = words.map((w) => w.deskewedCenterY).sort((a, b) => a - b);
  return (ys[Math.floor(ys.length / 2)] ?? 400) * 0.55;
}

export function buildOcrWordsFromAnnotations(
  annotations: Array<{ description: string; boundingPoly?: { vertices: Array<{ x?: number; y?: number }> } }>,
  skewAngle: number,
): OcrWord[] {
  const cos = Math.cos(skewAngle);
  const sin = Math.sin(skewAngle);

  return annotations.map((w) => {
    const ys = w.boundingPoly!.vertices.map((v) => v.y || 0);
    const xs = w.boundingPoly!.vertices.map((v) => v.x || 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerY = minY + (maxY - minY) / 2;

    const deskewedVertices = w.boundingPoly!.vertices.map((v) => {
      const x = v.x || 0;
      const y = v.y || 0;
      return { x: x * cos + y * sin, y: -x * sin + y * cos };
    });
    const dys = deskewedVertices.map((v) => v.y);
    const dxs = deskewedVertices.map((v) => v.x);
    const deskewedMinX = Math.min(...dxs);
    const deskewedMaxX = Math.max(...dxs);
    const deskewedMinY = Math.min(...dys);
    const deskewedMaxY = Math.max(...dys);

    return {
      text: w.description,
      minX,
      maxX,
      centerY,
      deskewedMinX,
      deskewedMaxX,
      deskewedCenterX: deskewedMinX + (deskewedMaxX - deskewedMinX) / 2,
      deskewedCenterY: deskewedMinY + (deskewedMaxY - deskewedMinY) / 2,
    };
  });
}

export function reconstructColumnAwareText(words: OcrWord[]): string {
  const splitX = getPageWidth(words) * 0.48;
  const rows = groupWordsIntoRows(words);
  const lines: string[] = [];

  for (const row of rows) {
    const { left, right } = splitRowByPageCenter(row, splitX);
    const leftText = joinWords(left);
    const rightText = joinWords(right);
    if (leftText) lines.push(leftText);
    if (rightText) lines.push(rightText);
  }

  return lines.join('\n');
}

export function parseBasicInfoFromWords(words: OcrWord[]): KkBasicInfoFields {
  const fields = emptyBasicInfo();
  const tableStartY = findTableStartY(words);
  const pageWidth = getPageWidth(words);
  const splitX = pageWidth * 0.48;

  const headerWords = words.filter(
    (w) =>
      w.deskewedCenterY < tableStartY &&
      !/GARUDA|REPUBLIK/i.test(w.text),
  );

  const rows = groupWordsIntoRows(headerWords);
  const pairedRows: { left: string; right: string }[] = [];

  for (const row of rows) {
    const { left, right } = splitRowByPageCenter(row, splitX);
    const leftText = joinWords(left);
    const rightText = joinWords(right);
    const joined = `${leftText} ${rightText}`.trim();
    if (!joined || isHeaderNoise(joined)) continue;
    if (/^(No\.?|NO\.?)\s*\d/i.test(joined)) continue;

    pairedRows.push({ left: leftText, right: rightText });
  }

  const rowMap = detectLayout(pairedRows);
  const dataRows = pairedRows
    .filter((row) => row.left.includes(':') || row.right.includes(':'))
    .slice(0, 4);

  dataRows.forEach((row, index) => {
    const mapping = rowMap[index];
    if (!mapping) return;

    const [leftField, rightField] = mapping;
    assignFieldValue(fields, leftField, extractValueFromSideText(row.left), row.left);
    assignFieldValue(fields, rightField, extractValueFromSideText(row.right), row.right);
  });

  return fields;
}

export function getHeaderLines(lines: string[]): string[] {
  const kkIdx = lines.findIndex((l) => /\b\d{16}\b/.test(l));
  const tableIdx = lines.findIndex((l) =>
    /Nama\s+Lengkap|NIK.*Kelamin|登録番号|\(\s*1\s*\).*\(\s*2\s*\)/i.test(l),
  );
  if (kkIdx >= 0 && tableIdx > kkIdx) {
    return lines.slice(kkIdx + 1, tableIdx).filter((l) => l.trim());
  }
  return lines.slice(0, Math.min(8, lines.length));
}

const ADDR_START_RE = /\b(KP\.?|JL\.?|JALAN|GANG|GG\.?|DSN\.?|DUSUN|KANDANG|PISANGAN|CICURUG)\b/i;

function parseMergedNamaAlamat(line: string): { kepalaKeluarga: string; alamat: string } {
  const colonIdx = line.indexOf(':');
  if (colonIdx < 0) return { kepalaKeluarga: '', alamat: '' };

  let value = line.substring(colonIdx + 1).replace(/^:\s*/, '').trim();
  const sagMatch = value.match(/,\s*S\.?\s*AG\.?\s*$/i);
  const sagSuffix = sagMatch ? ', S.AG' : '';
  const withoutSag = value.replace(/,\s*S\.?\s*AG\.?\s*$/i, '').trim();

  const kpMatch = withoutSag.match(/^([A-Z][A-Z\s',.]*?)\s+(KP\.?\s+.+)$/i);
  if (kpMatch) {
    return {
      kepalaKeluarga: `${kpMatch[1].trim()}${sagSuffix}`,
      alamat: kpMatch[2].trim(),
    };
  }

  const addrIdx = withoutSag.search(ADDR_START_RE);
  if (addrIdx > 0) {
    const beforeAddr = withoutSag.substring(0, addrIdx).trim();
    const alamatPart = withoutSag.substring(addrIdx).trim();
    const nameWordCount = beforeAddr.split(/\s+/).filter(Boolean).length;
    // OCR sering menyisipkan nama lengkap ke alamat (mis. ROMMY KANDANG RIZALDY BESAR AKBAR NO.79)
    if (nameWordCount <= 2) {
      return { kepalaKeluarga: '', alamat: alamatPart };
    }
    return {
      kepalaKeluarga: `${beforeAddr}${sagSuffix}`,
      alamat: alamatPart,
    };
  }

  const noMatch = withoutSag.match(/^([A-Z][A-Z\s',.]+?)\s+((?:[A-Z]+\s+)+NO\.?\s*\d+.*)$/i);
  if (noMatch) {
    return {
      kepalaKeluarga: `${noMatch[1].trim()}${sagSuffix}`,
      alamat: noMatch[2].trim(),
    };
  }

  return { kepalaKeluarga: value.replace(/^:\s*/, ''), alamat: '' };
}

function parseLabelLineValue(line: string, labelPattern: RegExp): string {
  const match = line.match(labelPattern);
  if (!match || match.index === undefined) return '';
  const after = line.substring(match.index + match[0].length);
  if (after.includes(':')) return extractValueFromSideText(after);
  return cleanValue(after);
}

export function parseBasicInfoFromMergedHeader(lines: string[]): KkBasicInfoFields {
  const fields = emptyBasicInfo();
  const headerLines = getHeaderLines(lines);
  const block = headerLines.join('\n');

  fields.rtRw = extractRtRw(block);
  fields.kodePos = extractKodePos(block);

  for (const line of headerLines) {
    const upper = line.toUpperCase();
    if (/^WWWWW+|REPUBLIK\s*INDONESIA\s*KODE\s*POS$/i.test(line.trim())) continue;

    if (/NAMA\s*KEPALA\s*KELUARGA/i.test(upper) || (/KEPALA\s*KELUARGA/i.test(upper) && /ALAMAT/i.test(upper))) {
      if (line.includes(':')) {
        const parsed = parseMergedNamaAlamat(line);
        if (parsed.kepalaKeluarga) fields.kepalaKeluarga = parsed.kepalaKeluarga;
        if (parsed.alamat) fields.alamat = parsed.alamat;
      } else {
        const name = parseLabelLineValue(line, /NAMA\s*KEPALA\s*KELUARGA/i);
        if (name) fields.kepalaKeluarga = name;
      }
      continue;
    }

    if (/\bALAMAT\b/i.test(upper) && !/KEPALA/i.test(upper)) {
      const alamat = parseLabelLineValue(line, /\bALAMAT\b/i);
      if (alamat) fields.alamat = alamat;
      continue;
    }

    if (/DESA|KELURAHAN/i.test(upper) && /KECAMATAN/i.test(upper)) {
      const value = extractValueFromSideText(line);
      const split = splitKecamatanKelurahan(value, '');
      if (split.kelurahan) fields.kelurahan = split.kelurahan;
      if (split.kecamatan) fields.kecamatan = split.kecamatan;
      continue;
    }

    if (/DESA|KELURAHAN/i.test(upper) && !/KECAMATAN/i.test(upper)) {
      const val = extractValueFromSideText(line) || parseLabelLineValue(line, /DESA\s*\/\s*KELURAHAN|\bDESA\b|\bKELURAHAN\b/i);
      if (val) fields.kelurahan = val;
      continue;
    }

    if (/KECAMATAN/i.test(upper) && !/DESA|KELURAHAN/i.test(upper)) {
      const val = extractValueFromSideText(line) || parseLabelLineValue(line, /\bKECAMATAN\b/i);
      if (val) fields.kecamatan = val;
      continue;
    }

    if (/KABUPATEN|KOTA/i.test(upper) && /PROVINSI/i.test(upper)) {
      const value = extractValueFromSideText(line);
      const split = splitKabKotaAndProvinsi(value, '');
      if (split.kabKota) fields.kabKota = split.kabKota;
      if (split.provinsi) fields.provinsi = split.provinsi;
      continue;
    }

    if (/PROVINSI/i.test(upper) && !/KABUPATEN/i.test(upper)) {
      const val = extractValueFromSideText(line) || parseLabelLineValue(line, /\bPROVINSI\b/i);
      if (val) fields.provinsi = val;
      continue;
    }

    if (/KABUPATEN|KOTA/i.test(upper) && !/PROVINSI/i.test(upper)) {
      const val = extractValueFromSideText(line) || parseLabelLineValue(line, /KABUPATEN\s*\/\s*KOTA|\bKABUPATEN\b/i);
      if (val) fields.kabKota = val;
      continue;
    }

    if (/RT\s*\/\s*RW|RT\s+RW/i.test(upper)) {
      const rtRw = extractRtRw(line);
      if (rtRw) fields.rtRw = rtRw;
    }

    if (/KODE\s*POS/i.test(upper)) {
      const kodePos = extractKodePos(line);
      if (kodePos) fields.kodePos = kodePos;
    }
  }

  return fields;
}

function extractValueAfterLabel(line: string, labelPattern: RegExp): string {
  const match = line.match(labelPattern);
  if (!match || match.index === undefined) return '';
  const afterLabel = line.substring(match.index + match[0].length);
  const colonIdx = afterLabel.indexOf(':');
  const raw = colonIdx >= 0 ? afterLabel.substring(colonIdx + 1) : afterLabel;
  return cleanValue(raw);
}

export function parseBasicInfo(lines: string[]): KkBasicInfoFields {
  return finalizeBasicInfo(parseBasicInfoFromMergedHeader(lines));
}

function splitKabKotaAndProvinsi(
  kabKota: string,
  provinsi: string,
): { kabKota: string; provinsi: string } {
  if (provinsi && kabKota && provinsi.toUpperCase() !== kabKota.toUpperCase()) {
    return { kabKota, provinsi };
  }

  const merged = (kabKota || provinsi).trim();
  if (!merged) return { kabKota: '', provinsi: '' };

  const jakarta = merged.match(/JAKARTA\s+(DKI\s+)?JAKARTA\s+(TIMUR|SELATAN|UTARA|BARAT|PUSAT)/i);
  if (jakarta) {
    const area = jakarta[2] || jakarta[3];
    return { kabKota: `JAKARTA ${area.toUpperCase()}`, provinsi: 'DKI JAKARTA' };
  }

  const dkiOnly = merged.match(/^(DKI\s+JAKARTA)\s+JAKARTA\s+(TIMUR|SELATAN|UTARA|BARAT|PUSAT)$/i);
  if (dkiOnly) {
    return { kabKota: `JAKARTA ${dkiOnly[2].toUpperCase()}`, provinsi: 'DKI JAKARTA' };
  }

  if (/^DKI\s+JAKARTA$/i.test(merged)) {
    return { kabKota: '', provinsi: 'DKI JAKARTA' };
  }

  const provMatch = merged.match(new RegExp(`^(.+?)\\s+(${INDONESIAN_PROVINCES.source})$`, 'i'));
  if (provMatch) {
    return { kabKota: provMatch[1].trim(), provinsi: provMatch[2].trim().toUpperCase() };
  }

  if (/^(JAWA|SUMATERA|KALIMANTAN|SULAWESI|NUSA|BALI|PAPUA|ACEH|BANTEN|RIAU|LAMPUNG|MALUKU|BENGKULU|JAMBI|BANGKA)/i.test(merged)) {
    return { kabKota: '', provinsi: merged.toUpperCase() };
  }

  return { kabKota: merged, provinsi: provinsi || '' };
}

function stripNameFromAddress(alamat: string, kepalaName: string): string {
  if (!alamat || !kepalaName) return alamat;
  const firstName = kepalaName.split(',')[0].trim().toUpperCase();
  const upperAlamat = alamat.toUpperCase();
  if (upperAlamat.startsWith(firstName)) {
    return alamat.substring(firstName.length).replace(/^[\s,.]+/, '').trim();
  }
  return alamat;
}

/** Hapus kata-kata nama kepala keluarga yang bocor ke field alamat (OCR merge). */
export function stripKepalaNameWordsFromAddress(alamat: string, kepalaName: string): string {
  if (!alamat || !kepalaName) return alamat;
  let result = alamat;
  const nameWords = kepalaName
    .split(',')[0]
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);

  for (const word of nameWords) {
    const safe = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\b${safe}\\b`, 'gi'), '');
  }

  return result.replace(/\s+/g, ' ').trim();
}

function splitKecamatanKelurahan(
  kelurahan: string,
  kecamatan: string,
): { kelurahan: string; kecamatan: string } {
  if (kelurahan && kecamatan && kelurahan !== kecamatan) {
    return { kelurahan, kecamatan };
  }

  const merged = (kelurahan || kecamatan).trim();
  if (!merged) return { kelurahan: '', kecamatan: '' };

  if (!merged.includes(' ')) {
    if (kelurahan) return { kelurahan: merged, kecamatan: '' };
    return { kelurahan: '', kecamatan: merged };
  }

  const words = merged.split(/\s+/);
  const isDirection = (w: string) => /^(UTARA|SELATAN|TIMUR|BARAT|TENGAH)$/i.test(w);

  if (words.length >= 3 && isDirection(words[words.length - 1])) {
    return {
      kecamatan: `${words[0]} ${words[words.length - 1]}`,
      kelurahan: words.slice(1, -1).join(' '),
    };
  }

  if (words.length >= 2) {
    return {
      kecamatan: words[0],
      kelurahan: words.slice(1).join(' '),
    };
  }

  return { kelurahan: merged, kecamatan: '' };
}

export function finalizeBasicInfo(fields: KkBasicInfoFields): KkBasicInfoFields {
  let result = { ...fields };

  result.kepalaKeluarga = result.kepalaKeluarga.replace(/^:\s*/, '').replace(/,\s*S\.?\s*AG\.?$/i, ', S.AG');
  result.alamat = result.alamat.replace(/^:\s*/, '').trim();
  result.alamat = stripNameFromAddress(result.alamat, result.kepalaKeluarga);

  const kabProv = splitKabKotaAndProvinsi(result.kabKota, result.provinsi);
  result.kabKota = kabProv.kabKota;
  result.provinsi = kabProv.provinsi;

  const kecKel = splitKecamatanKelurahan(result.kelurahan, result.kecamatan);
  result.kelurahan = kecKel.kelurahan;
  result.kecamatan = kecKel.kecamatan;

  return result;
}

export function mergeBasicInfo(
  primary: KkBasicInfoFields,
  secondary: KkBasicInfoFields,
): KkBasicInfoFields {
  return {
    kepalaKeluarga: primary.kepalaKeluarga || secondary.kepalaKeluarga,
    alamat: primary.alamat || secondary.alamat,
    rtRw: primary.rtRw || secondary.rtRw,
    kelurahan: primary.kelurahan || secondary.kelurahan,
    kecamatan: primary.kecamatan || secondary.kecamatan,
    kabKota: primary.kabKota || secondary.kabKota,
    kodePos: primary.kodePos || secondary.kodePos,
    provinsi: primary.provinsi || secondary.provinsi,
  };
}

export function parseMemberNamesFromWords(words: OcrWord[], kkNumber: string): Map<string, string> {
  const names = new Map<string, string>();
  const tableStartY = findTableStartY(words);
  const footerWord = words.find((w) => /Dikeluarkan|Dokumen ini telah/i.test(w.text));
  const tableEndY = footerWord?.deskewedCenterY ?? Infinity;

  const nikWords = words.filter(
    (w) =>
      /^\d{16}$/.test(w.text) &&
      w.text !== kkNumber &&
      w.deskewedCenterY >= tableStartY &&
      w.deskewedCenterY < tableEndY,
  );

  for (const nikWord of nikWords) {
    const rowWords = words.filter(
      (w) =>
        Math.abs(w.deskewedCenterY - nikWord.deskewedCenterY) < 16 &&
        w.deskewedCenterY >= tableStartY &&
        w.deskewedCenterY < tableEndY,
    );

    const rowNiks = rowWords
      .filter((w) => /^\d{16}$/.test(w.text))
      .sort((a, b) => a.deskewedMinX - b.deskewedMinX);
    const myIndex = rowNiks.findIndex((w) => w.text === nikWord.text);
    const leftBound = myIndex > 0 ? rowNiks[myIndex - 1].deskewedMaxX + 8 : 0;
    const rightBound = nikWord.deskewedMinX - 4;

    const nameWords = rowWords
      .filter(
        (w) =>
          w.deskewedCenterX >= leftBound &&
          w.deskewedCenterX < rightBound &&
          !/^\d{16}$/.test(w.text) &&
          !/^\d{1,2}$/.test(w.text) &&
          !/^[\d()]+$/.test(w.text) &&
          !/^(LAKI|PEREMPUAN|No|NIK)$/i.test(w.text),
      )
      .sort((a, b) => a.deskewedMinX - b.deskewedMinX);

    let name = nameWords.map((w) => w.text).join(' ').replace(/\s+/g, ' ').trim();
    name = name.replace(/^[\d.\s()-]+/, '').trim();
    if (name) names.set(nikWord.text, name);
  }

  return names;
}

function buildNikSegmentMap(lines: string[], kkNumber: string): Map<string, string> {
  const map = new Map<string, string>();

  for (const line of lines) {
    if (!/\b\d{16}\b/.test(line)) continue;
    if (/Nama\s+Lengkap|NIK.*Kelamin|Perkawinan Status/i.test(line)) continue;

    const nikMatches = [...line.matchAll(/\b(\d{16})\b/g)].filter((m) => m[1] !== kkNumber);
    for (let i = 0; i < nikMatches.length; i++) {
      const nik = nikMatches[i][1];
      const nikStart = nikMatches[i].index ?? 0;
      const segStart = i > 0 ? (nikMatches[i - 1].index ?? 0) + 16 : 0;
      const segEnd = i + 1 < nikMatches.length ? (nikMatches[i + 1].index ?? line.length) : line.length;
      const segment = line.substring(segStart, segEnd);
      map.set(nik, (map.get(nik) || '') + ' ' + segment);
    }
  }

  return map;
}

export function extractNameFromNikSegment(segment: string, nik: string): string {
  const nikIdx = segment.indexOf(nik);
  const beforeNik = nikIdx >= 0 ? segment.substring(0, nikIdx) : segment;
  const cleaned = beforeNik.replace(/^\d+(\s+\d+)?\s*/, '').trim();
  if (!cleaned) return '';

  const parts = cleaned.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 0) return parts[parts.length - 1];

  const matches = [...cleaned.matchAll(/([A-Z][A-Z\s',.]{2,})/g)];
  if (matches.length > 0) return matches[matches.length - 1][1].trim();
  return cleaned;
}

export { buildNikSegmentMap };
