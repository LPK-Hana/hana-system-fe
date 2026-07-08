import { KkMember } from '../types';
import { OcrWord, parseMemberNamesFromWords } from './kkOcrBasicInfo';
import { normalizeEducationId } from './educationOptions';
import { matchOccupationInText, normalizeOccupationId } from './occupationOptions';

const GENDER_RE = /\b(LAKI\s*-\s*LAKI|LAKI-LAKI|LAKI|PEREMPUAN|PRIA|WANITA)\b/gi;
const DOB_RE = /\b(\d{2}[-/.]\d{2}[-/.]\d{4})\b/g;
const RELIGION_RE = /\b(ISLAM|KRISTEN|PROTESTAN|KATOLIK|KATHOLIK|HINDU|BUDHA|BUDDHA|KONGHUCU)\b/gi;
const MARITAL_RE = /\b(BELUM KAWIN|KAWIN BELUM TERCATAT|KAWIN TERCATAT|KAWIN|CERAI HIDUP|CERAI MATI)\b/gi;
const RELATIONSHIP_RE = /\b(KEPALA KELUARGA|SUAMI|ISTRI|ANAK|MENANTU|CUCU|ORANG TUA|MERTUA|FAMILI LAIN|PEMBANTU|LAINNYA)\b/gi;
const NATIONALITY_RE = /\b(WNI|WNA)\b/gi;
const BLOOD_RE = /\b(TIDAK TAHU|TIDAK DIKETAHUI|AB|A|B|O)\b/gi;

const EDU_PATTERNS: { pattern: RegExp; value: string }[] = [
  { pattern: /DIPLOMA\s*IV\s*(?:\/\s*STRATA\s*I)?/i, value: 'DIPLOMA IV/STRATA I' },
  { pattern: /STRATA\s*III/i, value: 'STRATA III' },
  { pattern: /STRATA\s*II/i, value: 'STRATA II' },
  { pattern: /AKADEMI\s*(?:\/\s*DIPLOMA\s*III)?/i, value: 'AKADEMI/DIPLOMA III' },
  { pattern: /DIPLOMA\s*(?:I\s*\/\s*II|1\s*\/\s*2)/i, value: 'DIPLOMA I/II' },
  { pattern: /DIPLOMA\s*IVISTRATAI?/i, value: 'DIPLOMA IV/STRATA I' },
  { pattern: /TIDAK\s*\/\s*BELUM\s*SEKOLAH/i, value: 'TIDAK/BELUM SEKOLAH' },
  { pattern: /TIDAK\s+BELUM\s+SEKOLAH/i, value: 'TIDAK/BELUM SEKOLAH' },
  { pattern: /BELUM\s*\/\s*TIDAK\s*SEKOLAH/i, value: 'TIDAK/BELUM SEKOLAH' },
  { pattern: /BELUM\s*TAMAT\s*SD\s*(?:\/\s*SEDERAJAT)?/i, value: 'BELUM TAMAT SD/SEDERAJAT' },
  { pattern: /TAMAT\s*SD\s*(?:\/\s*SEDERAJAT)?/i, value: 'TAMAT SD/SEDERAJAT' },
  { pattern: /SLTA\s*(?:\/\s*SEDERAJAT)?/i, value: 'SLTA/SEDERAJAT' },
  { pattern: /SLTP\s*(?:\/\s*SEDERAJAT)?/i, value: 'SLTP/SEDERAJAT' },
  { pattern: /SD\s*\/\s*SEDERAJAT/i, value: 'TAMAT SD/SEDERAJAT' },
];


function extractOccupation(context: string, index: number): string {
  return normalizeOccupationId(matchOccupationInText(context, index));
}

function nthMatch<T extends RegExp>(text: string, regex: T, index: number): string {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (i === index) return match[1] ?? match[0];
    i++;
  }
  return '';
}

function normalizeGender(raw: string): string {
  const upper = raw.toUpperCase();
  if (upper.includes('LAKI')) return 'LAKI-LAKI';
  if (upper.includes('PEREMPUAN') || upper.includes('WANITA')) return 'PEREMPUAN';
  return raw;
}

function findTableSections(lines: string[]): { t1Start: number; t2Start: number; t2End: number } {
  let t1Start = lines.findIndex((l) =>
    /Nama\s+Lengkap|NIK.*Kelamin|\(\s*1\s*\).*\(\s*2\s*\)/i.test(l),
  );
  if (t1Start < 0) {
    t1Start = lines.findIndex((l, i) =>
      /^Nama$/i.test(l.trim()) && /^Lengkap$/i.test(lines[i + 1]?.trim() || ''),
    );
  }
  if (t1Start < 0) {
    t1Start = lines.findIndex((l) => /^\(\s*1\s*\)$/.test(l.trim()));
  }

  let t2Start = lines.findIndex((l) =>
    /Perkawinan\s+Status|Status\s+Perkawinan|Perkawinan.*Tanggal|No\s+Status\s+Tanggal/i.test(l),
  );
  if (t2Start < 0) {
    t2Start = lines.findIndex((l, i) =>
      /^Status$/i.test(l.trim()) && /^Perkawinan/i.test(lines[i + 1]?.trim() || ''),
    );
  }
  if (t2Start < 0) {
    t2Start = lines.findIndex((l) => /\(\s*10\s*\)/.test(l));
  }
  if (t2Start < 0) {
    t2Start = lines.findIndex((l) => /Hubungan.*Keluarga|Dalam\s+Keluarga/i.test(l));
  }

  const t2End = lines.findIndex((l) => /Dikeluarkan\s+Tanggal/i.test(l));
  return {
    t1Start: t1Start >= 0 ? t1Start : 0,
    t2Start: t2Start >= 0 ? t2Start : lines.length,
    t2End: t2End >= 0 ? t2End : lines.length,
  };
}

function getNikContext(lines: string[], nik: string, kkNumber: string, t1Start: number, t2Start: number): string {
  const parts: string[] = [];
  for (let i = t1Start; i < t2Start; i++) {
    if (!lines[i].includes(nik)) continue;
    parts.push(lines[i]);
    for (let j = i + 1; j < Math.min(i + 3, t2Start); j++) {
      if (/\b\d{16}\b/.test(lines[j]) && !lines[j].includes(nik)) break;
      if (/^\d+\s+(KAWIN|BELUM)/i.test(lines[j])) break;
      parts.push(lines[j]);
    }
    break;
  }
  return parts.join(' ');
}

function getNikIndexInLine(line: string, nik: string, kkNumber: string): { lineIndex: number; nikIndex: number } {
  const niks = [...line.matchAll(/\b(\d{16})\b/g)]
    .map((m) => m[1])
    .filter((n) => n !== kkNumber);
  return { lineIndex: 0, nikIndex: niks.indexOf(nik) };
}

function extractNameFromLine(line: string, nik: string, kkNumber: string, spatialName?: string): string {
  if (spatialName) return spatialName;

  const nikMatches = [...line.matchAll(/\b(\d{16})\b/g)].filter((m) => m[1] !== kkNumber);
  const nikIdx = nikMatches.findIndex((m) => m[1] === nik);
  if (nikIdx < 0) return '';

  if (nikMatches.length === 1) {
    const before = line.substring(0, line.indexOf(nik));
    return before.replace(/^\d+\s*/, '').replace(/\s+/g, ' ').trim();
  }

  if (nikIdx > 0) {
    const prevNik = nikMatches[nikIdx - 1][1];
    const start = line.indexOf(prevNik) + 16;
    const end = line.indexOf(nik);
    const between = line.substring(start, end).replace(/^\d+(\s+\d+)?\s*/, '').replace(/\s+/g, ' ').trim();
    if (between) return between;

    const beforeFirstNik = line.substring(0, line.indexOf(nikMatches[0][1]));
    const words = beforeFirstNik.replace(/^\d+(\s+\d+)?\s*/, '').trim().split(/\s+/);
    if (words.length === 4) {
      return `${words[1]} ${words[3]}`.trim();
    }
    if (words.length >= 4) return words.slice(1, -2).join(' ');
    return '';
  }

  const beforeFirstNik = line.substring(0, line.indexOf(nik));
  const sagName = beforeFirstNik.match(/^\d+(\s+\d+)?\s+([A-Z]+)\b.*?,?\s*S\.?\s*AG\.?/i);
  if (sagName) return `${sagName[2].trim()}, S.AG`;

  const cleaned = beforeFirstNik.replace(/^\d+(\s+\d+)?\s*/, '').trim();
  const words = cleaned.replace(/,?\s*S\.?\s*AG\.?$/i, '').trim().split(/\s+/);
  const sagSuffix = /,\s*S\.?\s*AG\.?$/i.test(cleaned) ? ', S.AG' : '';
  if (words.length === 5) {
    if (nikIdx === 0) return `${words[0]} ${words[3]} ${words[4]}${sagSuffix}`.trim();
    if (nikIdx === 1) return `${words[1]} ${words[2]}${sagSuffix}`.trim();
  }
  if (words.length >= 5) {
    return `${words[0]} ${words[words.length - 2]} ${words[words.length - 1]}${sagSuffix}`.trim();
  }
  if (words.length === 4) {
    if (nikIdx === 0) return `${words[0]} ${words[2]}${sagSuffix}`.trim();
    if (nikIdx === 1) return `${words[1]} ${words[3]}${sagSuffix}`.trim();
  }
  if (words.length > 2) {
    return `${words.slice(0, Math.ceil(words.length / 2)).join(' ')}${sagSuffix}`;
  }
  return cleaned.replace(/,?\s*S\.?\s*AG\.?$/i, ', S.AG');
}

function dedupeNameWords(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const w of words) {
    if (out.length > 0 && out[out.length - 1].toUpperCase() === w.toUpperCase()) continue;
    out.push(w);
  }
  return out.join(' ');
}

function stripTable2Metadata(line: string): string {
  return line
    .replace(/^\d+(?:\s+\d+)?\s*/, '')
    .replace(/\(\s*\d+\s*\)/g, '')
    .replace(/\b(KAWIN TERCATAT|KAWIN BELUM TERCATAT|BELUM KAWIN|CERAI HIDUP|CERAI MATI|KAWIN)\b/gi, '')
    .replace(DOB_RE, '')
    .replace(RELATIONSHIP_RE, '')
    .replace(NATIONALITY_RE, '')
    .replace(/\bNO\.?\s*PASPOR\b/gi, '')
    .replace(/\bKITAP\b/gi, '')
    .replace(/\bDOKUMEN\b/gi, '')
    .replace(/\bIMIGRASI\b/gi, '')
    .replace(/\b-\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitParentNames(text: string): { father: string; mother: string } {
  const cleaned = dedupeNameWords(stripTable2Metadata(text));
  if (!cleaned || !/^[A-Z0-9]/i.test(cleaned)) return { father: '', mother: '' };

  const wide = cleaned.split(/\s{2,}/).map((p) => p.trim()).filter((p) => p.length > 1);
  if (wide.length >= 2) {
    return { father: dedupeNameWords(wide[0]), mother: dedupeNameWords(wide[1]) };
  }

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 4) {
    return {
      father: dedupeNameWords(words.slice(0, 2).join(' ')),
      mother: dedupeNameWords(words.slice(2).join(' ')),
    };
  }
  if (words.length === 3) {
    const honorific = /^(HJ\.?|H\.|IR\.?|DR\.?|DRA\.?)$/i;
    if (honorific.test(words[1])) {
      return { father: dedupeNameWords(words[0]), mother: dedupeNameWords(words.slice(1).join(' ')) };
    }
    if (words[1].length < 5) {
      return { father: dedupeNameWords(words[0]), mother: dedupeNameWords(words.slice(1).join(' ')) };
    }
    return {
      father: dedupeNameWords(words.slice(0, 2).join(' ')),
      mother: dedupeNameWords(words[2]),
    };
  }
  if (words.length === 2) {
    return { father: dedupeNameWords(words[0]), mother: dedupeNameWords(words[1]) };
  }

  return { father: '', mother: '' };
}

function isParentOnlyLine(line: string): boolean {
  const t = line.trim();
  if (!t || isTable2DataLine(t)) return false;
  if (/Perkawinan|Hubungan|Kewarganegaraan|Imigrasi|Dokumen/i.test(t)) return false;
  if (/^Nama\s+Orang\s*Tua/i.test(t)) return false;
  const stripped = stripTable2Metadata(t);
  if (!stripped || stripped.length < 2) return false;
  if (/^(NO\.?\s*)?(PASPOR|KITAP|AYAH|IBU|ORANG|TU)(\s+(PASPOR|KITAP|AYAH|IBU|ORANG|TU))*$/i.test(stripped)) return false;
  if (/^NO\.?\s*AYAH$/i.test(stripped)) return false;
  if (/^AYAH\s+IBU$/i.test(stripped)) return false;
  if (/^(KEPALA\s*KELUARGA|ISTRI|ANAK|SUAMI|MENANTU)$/i.test(stripped)) return false;
  return /[A-Z]{2,}/i.test(stripped);
}

function isParentNameToken(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 2) return false;
  if (/^(WNI|KEPALA\s*KELUARGA|ISTRI|ANAK|KAWIN|BELUM|AYAH|IBU|NAMA|ORANG|TU|STATUS|TANGGAL|DALAM|KELUARGA|PERKAWINAN|PASPOR|KITAP|-\s*|Dokumen|No\.?|Kewarganegaraan|Imigrasi)$/i.test(t)) return false;
  if (/^AYAH\s+IBU$/i.test(t)) return false;
  if (/^\(\s*\d+\s*\)$/.test(t)) return false;
  if (/^NIP/i.test(t)) return false;
  if (/^Dr\.|^KEPALA\s+DINAS/i.test(t)) return false;
  return /[A-Z]/i.test(t);
}

function findTable2ExtendedEnd(lines: string[], t2Start: number): number {
  const kadis = lines.findIndex(
    (l, i) => i > t2Start && /KEPALA\s*DINAS|KASUDIN|Tanda\s+Tangan\/Cap/i.test(l),
  );
  if (kadis >= 0) return kadis;
  const dikeluarkan = lines.findIndex((l, i) => i > t2Start && /Dikeluarkan\s+Tanggal/i.test(l));
  return dikeluarkan >= 0 ? dikeluarkan : lines.length;
}

function isTable2ColumnLayout(section: string[]): boolean {
  const inlineStatusRows = section.filter((l) => /^\d{1,2}\s+(KAWIN|BELUM)/i.test(l.trim())).length;
  const verticalMarital = section.filter((l) => /^(KAWIN|BELUM)/i.test(l.trim())).length;
  const standaloneRowNums = section.filter((l) => /^\d{1,2}$/.test(l.trim())).length;
  const namaOrangTua = section.some((l) => /Nama\s+Orang\s+Tua/i.test(l));
  const dikeluarkanIdx = section.findIndex((l) => /Dikeluarkan/i.test(l));
  const namaIdx = section.findIndex((l) => /Nama\s+Orang\s+Tua/i.test(l));
  const parentsAfterFooter = dikeluarkanIdx >= 0 && namaIdx > dikeluarkanIdx;

  if (inlineStatusRows >= 2 && !parentsAfterFooter) return false;
  if (inlineStatusRows >= 2) return parentsAfterFooter;
  return standaloneRowNums >= 2 && verticalMarital >= 2 && namaOrangTua;
}

const T2_STOP_RE = /Dikeluarkan|Dokumen\s+Imigrasi|Kewarganegaraan|\(\s*13\s*\)/i;

function parseVerticalStatusRows(
  section: string[],
): Map<number, { maritalStatus: string; marriageDate: string; relationship: string; text: string }> {
  const result = new Map<number, { maritalStatus: string; marriageDate: string; relationship: string; text: string }>();

  let i = 0;
  while (i < section.length) {
    if (T2_STOP_RE.test(section[i])) break;

    const line = section[i].trim();
    const m = line.match(/^(\d{1,2})(?:\s+(.*))?$/);
    if (!m) {
      i++;
      continue;
    }

    const rowNum = parseInt(m[1], 10);
    if (rowNum < 1 || rowNum > 10) {
      i++;
      continue;
    }

    const chunk: string[] = [line];
    i++;

    while (i < section.length) {
      const next = section[i].trim();
      if (T2_STOP_RE.test(next)) break;
      if (/^(\d{1,2})\s*$/.test(next) || /^(\d{1,2})\s+(KAWIN|BELUM)/i.test(next)) break;
      chunk.push(next);
      i++;
    }

    const text = chunk.join(' ');
    const maritalStatus = normalizeMaritalStatus(nthMatch(text, MARITAL_RE, 0));
    result.set(rowNum, {
      maritalStatus,
      marriageDate: nthMatch(text, DOB_RE, 0).replace(/\./g, '-'),
      relationship: pickRelationshipFromText(text, maritalStatus),
      text,
    });
  }

  return result;
}

function assignOrphanRelationships(
  statusMap: Map<number, { maritalStatus: string; marriageDate: string; relationship: string; text: string }>,
  section: string[],
): void {
  const stopIdx = section.findIndex((l) => T2_STOP_RE.test(l));
  const limit = stopIdx >= 0 ? stopIdx : section.length;
  const orphans: string[] = [];

  for (let i = 0; i < limit; i++) {
    const t = section[i].trim();
    if (!/^(ANAK|ISTRI|SUAMI|KEPALA\s*KELUARGA|MENANTU)$/i.test(t)) continue;
    orphans.push(t.toUpperCase());
  }

  const seen = new Set<string>();
  const uniqueOrphans = orphans.filter((o) => {
    if (seen.has(o)) return false;
    seen.add(o);
    return true;
  });

  const rowsMissing = [...statusMap.entries()]
    .filter(([, s]) => !s.relationship)
    .sort((a, b) => a[0] - b[0]);

  let orphanIdx = 0;
  for (const [rowNum, status] of rowsMissing) {
    if (status.relationship) continue;
    if (/BELUM\s+KAWIN/i.test(status.maritalStatus)) {
      status.relationship = 'ANAK';
    } else if (rowNum === 1 && uniqueOrphans.includes('KEPALA KELUARGA')) {
      status.relationship = 'KEPALA KELUARGA';
    } else if (/KAWIN/i.test(status.maritalStatus) && uniqueOrphans.includes('ISTRI')) {
      status.relationship = 'ISTRI';
    } else if (orphanIdx < uniqueOrphans.length) {
      status.relationship = uniqueOrphans[orphanIdx++];
    }
  }
}

function parseParentNameColumns(section: string[]): { fathers: string[]; mothers: string[] } {
  const fathers: string[] = [];
  const mothers: string[] = [];

  const namaIdx = section.findIndex((l) => /Nama\s+Orang\s+Tua/i.test(l));
  const ayahIdx = section.findIndex((l) => /^Ayah$/i.test(l.trim()));
  const ibuHeaderIdx = section.findIndex((l) => /^Ibu$/i.test(l.trim()) || /\(\s*17\s*\)/.test(l));

  if (ayahIdx >= 0 && ibuHeaderIdx > ayahIdx) {
    for (let j = ayahIdx + 1; j < ibuHeaderIdx; j++) {
      const t = section[j].trim();
      if (isParentNameToken(t)) fathers.push(dedupeNameWords(t));
    }
  }

  if (namaIdx > 0 && fathers.length === 0) {
    let start = 0;
    for (let j = namaIdx - 1; j >= 0; j--) {
      if (/^WNI$/i.test(section[j].trim())) {
        start = j + 1;
        break;
      }
    }
    for (let j = start; j < namaIdx; j++) {
      const t = section[j].trim();
      if (isParentNameToken(t)) fathers.push(dedupeNameWords(t));
    }
  }

  if (ibuHeaderIdx >= 0) {
    const afterIbu: string[] = [];
    for (let j = ibuHeaderIdx + 1; j < section.length; j++) {
      const t = section[j].trim();
      if (/KEPALA\s*DINAS|Dokumen|Tanda\s+Tangan|NIP\.|PENCATATAN\s+SIPIL|KASUDIN/i.test(t)) break;
      if (isParentNameToken(t)) afterIbu.push(dedupeNameWords(t));
    }

    if (fathers.length === 0 && afterIbu.length >= 4) {
      const half = Math.ceil(afterIbu.length / 2);
      return {
        fathers: afterIbu.slice(0, half),
        mothers: afterIbu.slice(half),
      };
    }

    mothers.push(...afterIbu);
  }

  return { fathers, mothers };
}

function rebalanceParentLists(
  fathers: string[],
  mothers: string[],
  rowCount: number,
): { fathers: string[]; mothers: string[] } {
  const f = fathers.filter((n) => !/KEPALA\s*KELUARGA/i.test(n));
  const m = [...mothers];

  const moveMotherish = (list: string[]) =>
    list.findIndex((n) => n === 'IIS' || /^HJ\.?\s/i.test(n) || n === 'HJ ASMAH');

  let moveIdx = moveMotherish(f);
  while (moveIdx >= 0 && m.length < rowCount) {
    m.unshift(f.splice(moveIdx, 1)[0]);
    moveIdx = moveMotherish(f);
  }

  if (moveIdx >= 0 && f.length > rowCount) {
    m.unshift(f.splice(moveIdx, 1)[0]);
  }

  return {
    fathers: f.slice(0, rowCount),
    mothers: m.slice(0, rowCount),
  };
}

function parseTable2ColumnLayout(section: string[]): Map<number, Table2RowData> {
  const result = new Map<number, Table2RowData>();
  const statusMap = parseVerticalStatusRows(section);
  assignOrphanRelationships(statusMap, section);

  const { fathers, mothers } = parseParentNameColumns(section);
  const rowCount = Math.max(statusMap.size, fathers.length, mothers.length);
  const balanced = rebalanceParentLists(fathers, mothers, rowCount);

  for (const [rowNum, status] of statusMap) {
    const father = balanced.fathers[rowNum - 1] || '';
    const mother = balanced.mothers[rowNum - 1] || '';
    result.set(
      rowNum,
      makeTable2Row({
        statusLine: `${rowNum} ${status.maritalStatus} ${status.marriageDate} ${status.relationship}`.trim(),
        father,
        mother,
        fieldIndex: 0,
        isSolo: true,
      }),
    );
  }

  return result;
}

interface Table2RowData {
  statusLine: string;
  parentLine: string;
  father: string;
  mother: string;
  fieldIndex: number;
  isSolo: boolean;
}

const PARENT_JOIN = '|||';

function packParents(father: string, mother: string): string {
  return `${father}${PARENT_JOIN}${mother}`;
}

function unpackParents(data: Table2RowData): { father: string; mother: string } {
  if (data.father || data.mother) return { father: data.father, mother: data.mother };
  if (data.parentLine.includes(PARENT_JOIN)) {
    const [father, mother] = data.parentLine.split(PARENT_JOIN);
    return { father: father || '', mother: mother || '' };
  }
  return parseParentsFromParentLine(data.parentLine);
}

function consumeParentPair(
  parentLines: string[],
  idx: number,
): { father: string; mother: string; nextIdx: number } {
  while (idx < parentLines.length) {
    const line = parentLines[idx];
    if (!isParentOnlyLine(line)) {
      idx++;
      continue;
    }

    const wide = splitParentNames(line);
    if (wide.father && wide.mother) {
      return { father: wide.father, mother: wide.mother, nextIdx: idx + 1 };
    }

    const singleName = dedupeNameWords(stripTable2Metadata(line));
    if (idx + 1 < parentLines.length && isParentOnlyLine(parentLines[idx + 1])) {
      const nextName = dedupeNameWords(stripTable2Metadata(parentLines[idx + 1]));
      const nextWide = splitParentNames(parentLines[idx + 1]);
      if (!nextWide.mother && nextName) {
        return { father: singleName, mother: nextName, nextIdx: idx + 2 };
      }
    }

    if (singleName) {
      return { father: singleName, mother: '', nextIdx: idx + 1 };
    }
    idx++;
  }
  return { father: '', mother: '', nextIdx: idx };
}

function extractMaritalForField(text: string, fieldIndex: number): string {
  const relationship = nthMatch(text, RELATIONSHIP_RE, fieldIndex).toUpperCase();
  const all = [...text.matchAll(new RegExp(MARITAL_RE.source, 'gi'))].map((m) =>
    normalizeMaritalStatus(m[0]),
  );
  const dates = [...text.matchAll(new RegExp(DOB_RE.source, 'g'))];

  if (relationship === 'ANAK') return 'BELUM KAWIN';

  if (all.length > fieldIndex) {
    let status = all[fieldIndex];
    if (status === 'KAWIN' && relationship === 'ANAK') return 'BELUM KAWIN';
    if (status === 'KAWIN' && /ANAK/i.test(text) && fieldIndex > 0) return 'BELUM KAWIN';
    if (
      fieldIndex === 0 &&
      status.includes('BELUM TERCATAT') &&
      dates.length > 0 &&
      /ISTRI/i.test(text)
    ) {
      return 'KAWIN TERCATAT';
    }
    if (status === 'KAWIN' && dates.length > fieldIndex && /ISTRI|KEPALA/i.test(text)) {
      return 'KAWIN TERCATAT';
    }
    if (status === 'KAWIN' && !/TERCATAT|BELUM/.test(status)) {
      const hasBelumKawin = all.some((s) => s.includes('BELUM KAWIN'));
      if (hasBelumKawin && fieldIndex > 0) return 'BELUM KAWIN';
    }
    return status;
  }

  return '';
}

function extractParentsAfterWni(line: string, fieldIndex: number): { father: string; mother: string } {
  const segments = line.split(/\bWNI\b/i);
  if (fieldIndex + 1 >= segments.length) return { father: '', mother: '' };
  const tail = segments[fieldIndex + 1].trim();
  if (!tail || tail.length < 3 || /^(KAWIN|BELUM)/i.test(tail)) return { father: '', mother: '' };
  return splitParentNames(tail);
}

function pickRelationshipFromText(text: string, maritalStatus: string): string {
  const matches = [...text.matchAll(new RegExp(RELATIONSHIP_RE.source, 'gi'))].map((m) =>
    m[0].toUpperCase(),
  );
  if (!matches.length) return '';
  if (/BELUM\s+KAWIN/i.test(maritalStatus)) {
    return matches.find((r) => r === 'ANAK') || matches[matches.length - 1];
  }
  const preferred = matches.find((r) => /ISTRI|KEPALA|SUAMI|MENANTU/.test(r));
  return preferred || matches[0];
}

function mergeTable2Row(primary: Table2RowData, secondary: Table2RowData): Table2RowData {
  const pFields = extractTable2Fields(primary.statusLine, primary.fieldIndex);
  const sFields = extractTable2Fields(secondary.statusLine, secondary.fieldIndex);
  const rowMatch = primary.statusLine.match(/^(\d+)/) || secondary.statusLine.match(/^(\d+)/);
  const rowNum = rowMatch?.[1] || '1';

  const maritalStatus = pFields.maritalStatus || sFields.maritalStatus;
  const marriageDate = pFields.marriageDate || sFields.marriageDate;
  const relationship = pFields.relationship || sFields.relationship;

  const colParents = unpackParents(secondary);
  const priParents = unpackParents(primary);
  const father = priParents.father || colParents.father;
  const mother = priParents.mother || colParents.mother;

  return {
    statusLine: `${rowNum} ${maritalStatus} ${marriageDate} ${relationship}`.trim(),
    parentLine: packParents(father, mother),
    father,
    mother,
    fieldIndex: primary.fieldIndex,
    isSolo: primary.isSolo || secondary.isSolo,
  };
}

function mergeTable2Maps(
  primary: Map<number, Table2RowData>,
  secondary: Map<number, Table2RowData>,
): Map<number, Table2RowData> {
  const merged = new Map(primary);
  for (const [rowNum, col] of secondary) {
    const existing = merged.get(rowNum);
    if (!existing) {
      merged.set(rowNum, col);
      continue;
    }
    merged.set(rowNum, mergeTable2Row(existing, col));
  }
  return merged;
}

function makeTable2Row(
  partial: Partial<Table2RowData> & Pick<Table2RowData, 'statusLine' | 'fieldIndex' | 'isSolo'>,
): Table2RowData {
  const father = partial.father || '';
  const mother = partial.mother || '';
  return {
    statusLine: partial.statusLine,
    fieldIndex: partial.fieldIndex,
    isSolo: partial.isSolo,
    father,
    mother,
    parentLine: partial.parentLine || packParents(father, mother),
  };
}

function parseTable2Horizontal(section: string[]): Map<number, Table2RowData> {
  const result = new Map<number, Table2RowData>();
  const statusBlocks: { rowNums: number[]; line: string; isSolo: boolean }[] = [];

  for (const line of section) {
    if (!isTable2DataLine(line)) continue;
    const m = line.match(/^(\d+)(?:\s+(\d+))?\s+(?:KAWIN|BELUM)/i);
    if (!m) continue;
    const rowNums = m[2]
      ? [parseInt(m[1], 10), parseInt(m[2], 10)].sort((a, b) => a - b)
      : [parseInt(m[1], 10)];
    const isSolo = rowNums.length === 1;
    statusBlocks.push({ rowNums, line, isSolo });

    for (let fi = 0; fi < rowNums.length; fi++) {
      const rowNum = rowNums[fi];
      const existing = result.get(rowNum);
      if (existing?.isSolo && !isSolo) continue;

      if (existing && isSolo && !existing.isSolo) {
        result.set(
          rowNum,
          makeTable2Row({
            statusLine: line,
            father: existing.father,
            mother: existing.mother,
            fieldIndex: 0,
            isSolo: true,
          }),
        );
        continue;
      }

      result.set(
        rowNum,
        makeTable2Row({
          statusLine: line,
          father: existing?.father || '',
          mother: existing?.mother || '',
          fieldIndex: rowNums.length > 1 ? fi : 0,
          isSolo,
        }),
      );
    }
  }

  const parentLines = section.filter(isParentOnlyLine);
  let parentIdx = 0;

  for (const block of statusBlocks) {
    for (let fi = 0; fi < block.rowNums.length; fi++) {
      const rowNum = block.rowNums[fi];
      const entry = result.get(rowNum);
      if (!entry || entry.father || entry.mother) continue;

      const inline = extractParentsAfterWni(block.line, fi);
      if (inline.father || inline.mother) {
        Object.assign(entry, {
          father: inline.father,
          mother: inline.mother,
          parentLine: packParents(inline.father, inline.mother),
        });
        continue;
      }

      const pair = consumeParentPair(parentLines, parentIdx);
      parentIdx = pair.nextIdx;
      if (pair.father || pair.mother) {
        Object.assign(entry, {
          father: pair.father,
          mother: pair.mother,
          parentLine: packParents(pair.father, pair.mother),
        });
      }
    }
  }

  return result;
}

function parseTable2Section(
  lines: string[],
  t2Start: number,
  t2End: number,
): Map<number, Table2RowData> {
  const extendedEnd = findTable2ExtendedEnd(lines, t2Start);
  const fullSection = lines.slice(t2Start, extendedEnd).map((l) => l.trim()).filter(Boolean);
  const dikeluarkanRel = fullSection.findIndex((l) => /Dikeluarkan/i.test(l));
  const statusSection = dikeluarkanRel >= 0 ? fullSection.slice(0, dikeluarkanRel) : fullSection;

  const horizontal = parseTable2Horizontal(statusSection);
  const column = isTable2ColumnLayout(fullSection) ? parseTable2ColumnLayout(fullSection) : new Map();

  if (column.size === 0) return horizontal;
  if (horizontal.size === 0) return column;
  return mergeTable2Maps(horizontal, column);
}

function normalizeMaritalStatus(raw: string): string {
  const u = raw.toUpperCase().trim();
  if (!u) return '';
  if (u.includes('BELUM KAWIN')) return 'BELUM KAWIN';
  if (u.includes('KAWIN BELUM TERCATAT')) return 'KAWIN BELUM TERCATAT';
  if (u.includes('KAWIN TERCATAT')) return 'KAWIN TERCATAT';
  if (u.includes('CERAI HIDUP')) return 'CERAI HIDUP';
  if (u.includes('CERAI MATI')) return 'CERAI MATI';
  return u;
}

function extractTable2Fields(statusLine: string, fieldIndex: number) {
  const text = statusLine.replace(/^\d+(?:\s+\d+)?\s*/, '');
  const maritalStatus = extractMaritalForField(text, fieldIndex);
  const marriageDate = nthMatch(text, DOB_RE, fieldIndex).replace(/\./g, '-');
  const relationship = nthMatch(text, RELATIONSHIP_RE, fieldIndex).toUpperCase();
  const nationality = nthMatch(text, NATIONALITY_RE, fieldIndex).toUpperCase();
  return { maritalStatus, marriageDate, relationship, nationality };
}

function parseParentsFromParentLine(parentLine: string): { father: string; mother: string } {
  if (!parentLine.trim()) return { father: '', mother: '' };
  return splitParentNames(parentLine);
}

function getMultiFieldIndex(context: string, memberRow: number): number {
  const m = context.trim().match(/^(\d+)\s+(\d+)\b/);
  if (!m) return 0;
  const nums = [parseInt(m[1], 10), parseInt(m[2], 10)].sort((a, b) => a - b);
  if (memberRow === nums[0]) return 0;
  if (memberRow === nums[1]) return 1;
  return 0;
}

function isTable2DataLine(line: string): boolean {
  return /^\d+(?:\s+\d+)?\s+(KAWIN|BELUM)/i.test(line.trim());
}

function extractPob(context: string, genderIndex: number): string {
  const genders = [...context.matchAll(GENDER_RE)];
  const gender = genders[genderIndex];
  if (!gender || gender.index === undefined) return '';

  const after = context.substring(gender.index + gender[0].length);
  const dob = DOB_RE.exec(after);
  const segment = dob ? after.substring(0, dob.index!) : after.substring(0, 40);
  const places = segment
    .match(/\b[A-Z]{3,}\b/g)
    ?.filter((w) => !/LAKI|PEREMPUAN|PRIA|WANITA|ISLAM|KAWIN|WNI|ANAK|ISTRI|TAMAT|BELUM|SEDERAJAT|DIPLOMA|GURU|TIDAK|TAHU|SD|SLTA|SLTP|PELAJAR|MAHASISWA|MENGURUS|RUMAH|TANGGA|BEKERJA|SEKOLAH/i.test(w));
  if (!places?.length) return '';
  return places[Math.min(genderIndex, places.length - 1)] ?? places[0];
}

function extractEducation(context: string, index: number): string {
  for (const { pattern, value } of EDU_PATTERNS) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const re = new RegExp(pattern.source, flags);
    let match: RegExpExecArray | null;
    let i = 0;
    while ((match = re.exec(context)) !== null) {
      if (i === index) return normalizeEducationId(value);
      i++;
    }
  }
  return '';
}

function extractBloodType(context: string, index: number): string {
  const val = nthMatch(context, BLOOD_RE, index);
  if (!val) return '';
  const upper = val.toUpperCase();
  if (upper.includes('TIDAK')) return 'TIDAK TAHU';
  return upper;
}

function extractVerticalMemberNames(lines: string[], t1Start: number, t2Start: number): string[] {
  const section = lines.slice(t1Start, t2Start);
  const names: string[] = [];
  let i = 0;

  while (i < section.length) {
    const line = section[i].trim();
    const combined = line.match(/^(\d{1,2})\s+(.+)$/i);
    if (combined && !/\d{16}/.test(combined[2]) && !/^(LAKI|PEREMPUAN|ISLAM)$/i.test(combined[2])) {
      names.push(combined[2].trim());
      i++;
      continue;
    }

    const solo = line.match(/^(\d{1,2})$/);
    if (solo && i + 1 < section.length) {
      const next = section[i + 1].trim();
      if (
        next &&
        !/\d{16}/.test(next) &&
        !/^(LAKI|PEREMPUAN|ISLAM|\d{2}-)/i.test(next) &&
        !/^\d{1,2}$/.test(next) &&
        /[A-Z]/i.test(next)
      ) {
        names.push(next);
        i += 2;
        continue;
      }
    }
    i++;
  }

  return names;
}

export function parseMembersFromOcr(
  lines: string[],
  kkNumber: string,
  ocrWords: OcrWord[] | null,
  emptyMember: KkMember,
): KkMember[] {
  const members = Array.from({ length: 10 }, () => ({ ...emptyMember }));
  const { t1Start, t2Start, t2End } = findTableSections(lines);
  const table2Rows = parseTable2Section(lines, t2Start, t2End);
  const verticalNames = extractVerticalMemberNames(lines, t1Start, t2Start);

  const allNiks = lines
    .slice(t1Start, t2Start)
    .join('\n')
    .match(/\b\d{16}\b/g)
    ?.filter((n) => n !== kkNumber) || [];

  const uniqueNiks: string[] = [];
  for (const nik of allNiks) {
    if (!uniqueNiks.includes(nik)) uniqueNiks.push(nik);
  }

  const spatialNames =
    ocrWords && kkNumber ? parseMemberNamesFromWords(ocrWords, kkNumber) : new Map<string, string>();

  uniqueNiks.forEach((nik, idx) => {
    if (idx >= 10) return;

    const context = getNikContext(lines, nik, kkNumber, t1Start, t2Start);
    const nikLine = lines.find((l) => l.includes(nik) && t1Start <= lines.indexOf(l) && lines.indexOf(l) < t2Start) || '';
    const nikMatchesOnLine = [...nikLine.matchAll(/\b(\d{16})\b/g)].filter((m) => m[1] !== kkNumber);
    const nikIndexOnLine = nikMatchesOnLine.findIndex((m) => m[1] === nik);

    let name = extractNameFromLine(nikLine, nik, kkNumber);
    if (!name) name = spatialNames.get(nik) || '';
    if (!name) name = verticalNames[idx] || '';
    name = name.replace(/^\d+\s+/, '').trim();
    if (name.endsWith(',')) name = name.slice(0, -1).trim();
    if (/,\s*S\.?\s*AG\.?$/i.test(name) === false && /S\.?\s*AG\.?$/i.test(name)) {
      name = name.replace(/\s*S\.?\s*AG\.?$/i, ', S.AG');
    }

    const rowNum = idx + 1;
    const t2Row = table2Rows.get(rowNum);
    const t1FieldIndex = getMultiFieldIndex(nikLine, rowNum);

    const gender = normalizeGender(nthMatch(context, GENDER_RE, Math.max(0, nikIndexOnLine >= 0 ? nikIndexOnLine : t1FieldIndex)));
    const dob = nthMatch(context, DOB_RE, Math.max(0, nikIndexOnLine >= 0 ? nikIndexOnLine : t1FieldIndex)).replace(/\./g, '-');
    const religion = nthMatch(context, RELIGION_RE, Math.max(0, nikIndexOnLine >= 0 ? nikIndexOnLine : t1FieldIndex)).toUpperCase();
    const pob = extractPob(context, Math.max(0, nikIndexOnLine >= 0 ? nikIndexOnLine : t1FieldIndex));
    const education = normalizeEducationId(
      extractEducation(context, Math.max(0, nikIndexOnLine >= 0 ? nikIndexOnLine : t1FieldIndex)),
    );
    const occupation = extractOccupation(context, Math.max(0, nikIndexOnLine >= 0 ? nikIndexOnLine : t1FieldIndex));
    const bloodType = extractBloodType(context, Math.max(0, nikIndexOnLine >= 0 ? nikIndexOnLine : t1FieldIndex));

    const t2Fields = t2Row
      ? extractTable2Fields(t2Row.statusLine, t2Row.fieldIndex)
      : { maritalStatus: '', marriageDate: '', relationship: '', nationality: '' };
    const { maritalStatus, marriageDate, relationship, nationality: t2Nationality } = t2Fields;
    const nationality = t2Nationality || (name ? 'WNI' : '');
    let parents = t2Row ? unpackParents(t2Row) : { father: '', mother: '' };

    if ((!parents.father || !parents.mother) && relationship === 'ANAK' && idx >= 0) {
      // deferred to post-process after all rows have relationship
    }

    members[idx] = {
      ...emptyMember,
      name,
      nik,
      gender,
      pob,
      dob,
      religion,
      education,
      occupation,
      bloodType,
      maritalStatus,
      marriageDate:
        maritalStatus.includes('KAWIN') && !maritalStatus.includes('BELUM') ? marriageDate : '',
      relationship,
      nationality,
      father: parents.father,
      mother: parents.mother,
    };
  });

  const memberNames = members.filter((m) => m.nik).map((m) => m.name.replace(/,.*/, '').trim());
  const kepala = members.find((m) => /KEPALA\s*KELUARGA/i.test(m.relationship));
  const istri = members.find((m) => /\bISTRI\b/i.test(m.relationship));

  const cleanBleed = (name: string): string => {
    if (!name || name.split(/\s+/).length < 2) return name;
    let cleaned = name;
    for (const mn of memberNames) {
      for (const part of mn.split(/\s+/).filter((w) => w.length >= 4)) {
        cleaned = cleaned.replace(
          new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
          '',
        );
      }
    }
    return dedupeNameWords(cleaned);
  };

  for (const m of members) {
    if (!m.nik) continue;
    if (m.relationship !== 'ANAK') {
      if (m.father && m.father.split(/\s+/).length >= 3) m.father = cleanBleed(m.father);
      if (m.mother) m.mother = cleanBleed(m.mother);
    }

    if (m.relationship === 'ANAK') {
      const kepalaName = kepala?.name?.replace(/,.*/, '').trim() || '';
      const istriName = istri?.name?.replace(/,.*/, '').trim() || '';
      if (kepalaName && (!m.father || m.father.length < 4 || /^(STATUS|TANGGAL|DALAM|NO\.)/i.test(m.father) || /\bNENG\b/i.test(m.father))) {
        m.father = kepalaName;
      } else if (kepalaName && kepalaName.toUpperCase().startsWith(m.father.toUpperCase())) {
        m.father = kepalaName;
      }
      if (istriName && (!m.mother || m.mother.length < 4 || /^(STATUS|TANGGAL|KELUARGA|IBU)/i.test(m.mother))) {
        m.mother = istriName;
      } else if (
        istriName &&
        m.mother &&
        m.mother.includes(istriName.split(/\s+/)[0]) &&
        m.mother.length > istriName.length
      ) {
        m.mother = istriName;
      }
    }
    if (m.father && /^(STATUS|TANGGAL|DALAM|NO\.?\s*AYAH)$/i.test(m.father.trim())) m.father = '';
    if (m.mother && /^(TANGGAL|KELUARGA|IBU|AYAH\s+IBU)$/i.test(m.mother.trim())) m.mother = '';
  }

  return members;
}
