import suratTanggunganJpTemplate from '@/app/admin-dashboard/contoh-data/template/Surat_Tanggungan_Jepang.lpk-hana-template-update-1.json';
import type { SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import { keepRomanji } from './translations';

export const SURAT_TANGGUNGAN_JP_TEMPLATE = suratTanggunganJpTemplate.template;

export const SURAT_TANGGUNGAN_JP_MARGINS = {
  top: SURAT_TANGGUNGAN_JP_TEMPLATE.margins.top,
  right: SURAT_TANGGUNGAN_JP_TEMPLATE.margins.right,
  bottom: SURAT_TANGGUNGAN_JP_TEMPLATE.margins.bottom,
  left: SURAT_TANGGUNGAN_JP_TEMPLATE.margins.left,
} as const;

const BASE_HTML = SURAT_TANGGUNGAN_JP_TEMPLATE.pages[0]?.html ?? '';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function phRegex(key: string): RegExp {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(&lt;${escaped}&gt;|<${escaped}>)`, 'gi');
}

function replaceAll(html: string, key: string, value: string): string {
  return html.replace(phRegex(key), escapeHtml(value) || '\u00A0');
}

function formatGenderJp(gender: string): string {
  const g = gender.toUpperCase();
  if (g.startsWith('L') || g.includes('LAKI') || g === 'M' || g === '男') return '男';
  if (g.startsWith('P') || g.includes('PEREMPUAN') || g === 'F' || g === '女') return '女';
  return gender || '男';
}

function replaceGenderPlaceholder(html: string, gender: string): string {
  const value = escapeHtml(formatGenderJp(gender));
  // Template update: satu token <男/女>
  const asToken = replaceAll(html, '男/女', value);
  if (asToken !== html) return asToken;
  // Fallback versi lama (span terpisah)
  return html.replace(
    /(?:&lt;|<)\s*(?:<\/span>)?\s*(?:<span[^>]*>)?\s*男\s*(?:<\/span>)?\s*(?:<span[^>]*>)?\s*\/\s*(?:<\/span>)?\s*(?:<span[^>]*>)?\s*女\s*(?:<\/span>)?\s*(?:<span[^>]*>)?\s*(?:&gt;|>)/gi,
    value,
  );
}

function formatStDobJpNatural(dob: string | undefined): string {
  if (!dob) return '';
  const raw = dob.includes('T') ? dob.split('T')[0] : dob;
  const parts = raw.split('-');
  if (parts.length !== 3) return raw;
  let y: string;
  let m: string;
  let d: string;
  if (parts[0].length === 4) {
    [y, m, d] = parts;
  } else {
    [d, m, y] = parts;
  }
  return `${+y}年${+m}月${+d}日`;
}

function boldJpTitle(html: string): string {
  return html.replace(/扶　養　証　明　書/g, '<strong>扶　養　証　明　書</strong>');
}

/** Bungkus dua tableWrapper nama asli template; rapatkan jarak katakana + 氏名 via CSS */
function wrapNameStackBlocks(html: string): string {
  const pattern =
    /(<div class="tableWrapper"><table class="doc-table doc-borderless-table" data-table-variant="borderless" style="min-width: 618px;">[\s\S]*?NAMA PESERTA KATAKANA[\s\S]*?<\/table><\/div>)\s*(<div class="tableWrapper"><table class="doc-table doc-borderless-table" data-table-variant="borderless" style="min-width: 618px;">[\s\S]*?氏名[\s\S]*?<\/table><\/div>)/;

  return html.replace(pattern, (_m, kanaBlock, nameBlock) => {
    const trimmedKana = trimEmptySpacerCells(kanaBlock);
    return `<div class="st-jp-stack-group">${trimmedKana}${nameBlock}</div>`;
  });
}

/** Tandai tabel 本籍 asli template (147px, 2 kolom) untuk rapatkan baris katakana + romaji */
function markDomisiliStackTable(html: string): string {
  return html.replace(
    /(<div class="tableWrapper">)(<table class="doc-table doc-borderless-table" data-table-variant="borderless" style="min-width: 147px;">)/,
    '<div class="tableWrapper st-jp-stack-table">$2',
  );
}

function trimDomisiliSpacerCells(html: string): string {
  return html.replace(
    /(<div class="tableWrapper st-jp-stack-table"><table[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody><\/table><\/div>)/i,
    (_m, open, body, close) => {
      const rows = body.match(/<tr>[\s\S]*?<\/tr>/gi) ?? [];
      const trimmed = rows.map((row) => trimEmptySpacerCells(row));
      return open + trimmed.join('') + close;
    },
  );
}

/** Dua baris kosong setelah 本籍 — sama seperti Domisili di versi Indonesia */
function ensureDomisiliTrailingBreaks(html: string): string {
  const doubleGap = '<p><br></p><p><br></p>';
  return html.replace(
    /(<div class="tableWrapper st-jp-stack-table">[\s\S]*?<\/table><\/div>)\s*(?:<p[^>]*>\s*<br\s*\/?>\s*<\/p>\s*)*(<p[^>]*><span[^>]*>下記の者)/,
    `$1${doubleGap}$2`,
  );
}

/** Satu baris kosong setelah 村…御中 */
function ensureBreakAfterVillageLine(html: string): string {
  const gap = '<p><br></p>';
  return html.replace(
    /(<p[^>]*>[\s\S]*?御中[\s\S]*?<\/p>)\s*(?:<p[^>]*>\s*<br\s*\/?>\s*<\/p>\s*)*(?=<div class="(?:tableWrapper|st-jp-stack-group)">)/,
    `$1${gap}`,
  );
}

/** Satu baris kosong sebelum baris katakana 本籍 */
function ensureBreakBeforeDomisiliKatakana(html: string): string {
  const gap = '<p><br></p>';
  return html.replace(
    /(<table class="doc-table doc-borderless-table" data-table-variant="borderless" style="min-width: 617px;">[\s\S]*?<\/table><\/div>)\s*(?:<p[^>]*>\s*<br\s*\/?>\s*<\/p>\s*)*(<div class="tableWrapper st-jp-stack-table">)/,
    `$1${gap}$2`,
  );
}

/** Hilangkan <p><br></p> di sel kosong yang menambah tinggi baris */
function trimEmptySpacerCells(rowHtml: string): string {
  return rowHtml.replace(
    /<td([^>]*)>\s*<p>\s*<br\s*\/?>\s*<\/p>\s*<\/td>/gi,
    '<td$1><p style="margin:0;padding:0;line-height:1;">&nbsp;</p></td>',
  );
}

function replaceVillageLine(html: string, villageNameJp: string): string {
  const village = (villageNameJp || '').trim();
  const text = `${escapeHtml(village)}村　御中`;
  return html.replace(/(?:[^<]*?)村\s*御中/i, text);
}

function replaceJpDatePlaceholder(html: string, value: string): string {
  if (!value) return html;
  return html.replace(/:\s*(?:&nbsp;|\s)*年　月　日/i, `: ${escapeHtml(value)}`);
}

/** Ganti 発行日：… — placeholder kosong ATAU contoh tanggal di template */
function replaceIssueDatePlaceholder(html: string, value: string): string {
  if (!value) return html;
  const safe = escapeHtml(value);
  return html
    .replace(/発行日：年月日(?:\s|&nbsp;)*/i, `発行日：${safe} `)
    .replace(/発行日：\d{4}年\d{1,2}月\d{1,2}日(?:\s|&nbsp;)*/i, `発行日：${safe} `);
}

function replaceNIKValue(html: string, nik: string): string {
  if (!nik) return html;
  return html.replace(
    /(身分証明書番号[\s\S]*?<td[^>]*>\s*<p>\s*:\s*)(?:&nbsp;|\s)*(<\/p>)/i,
    `$1${escapeHtml(nik)}$2`,
  );
}

function replaceDomisili(html: string, data: SuratTanggunganFormData): string {
  const jpRaw = data.applicant.domisiliJp || data.applicant.domisiliKatakana || '';
  const jpLine = escapeHtml(jpRaw.replace(/,\s*/g, '・')) || '\u00A0';
  const romajiLine = escapeHtml(keepRomanji(data.applicant.domisili || '')) || '\u00A0';
  let next = html.replace(/DESA,\s*KECAMATAN,\s*KAB\/KOTA,\s*PROVINSI\s*\(katakana\)/gi, jpLine);
  next = next.replace(/DESA,\s*KECAMATAN,\s*KAB\/KOTA,\s*PROVINSI(?:\s*ALFABET)?/gi, romajiLine);
  return next;
}

function buildDependentRows(data: SuratTanggunganFormData): string {
  const rows = data.dependents;
  const count = Math.max(rows.length, 1);
  const cell =
    'white-space: normal; overflow-wrap: break-word; vertical-align: top; text-align: center;';

  let html = '';
  for (let i = 0; i < count; i += 1) {
    const row = rows[i];
    html += `<tr>
<td colspan="1" rowspan="1" style="${cell}"><p style="text-align: center;">${i + 1}</p></td>
<td colspan="1" rowspan="1" style="${cell}"><p style="text-align: center;">${escapeHtml(row?.relationshipJp || row?.relationship || '') || '<br>'}</p></td>
<td colspan="1" rowspan="1" style="${cell}"><p style="text-align: center;">${escapeHtml(row?.nameJp || row?.name || '') || '<br>'}</p></td>
<td colspan="1" rowspan="1" style="${cell}"><p style="text-align: center;">${escapeHtml(formatStDobJpNatural(row?.dob || '')) || '<br>'}</p></td>
</tr>`;
  }

  return html;
}

function injectDependentsTable(html: string, data: SuratTanggunganFormData): string {
  const tableRe = /(<table class="doc-table"[^>]*>[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>\s*<\/table>)/i;
  const match = html.match(tableRe);
  if (!match) return html;

  const tbody = match[2];
  if (!tbody.includes('扶養者本人との関係')) return html;

  const headerMatch = tbody.match(/<tr>[\s\S]*?扶養者本人との関係[\s\S]*?<\/tr>/i);
  if (!headerMatch) return html;

  const nextBody = `${headerMatch[0]}${buildDependentRows(data)}`;
  return html.replace(tableRe, `$1${nextBody}$3`);
}

function replaceSignDateLine(html: string, data: SuratTanggunganFormData): string {
  const city = (data.locationJp || data.locationId || '').trim();
  const year = data.signDateYear?.trim() || '';
  const month = data.signDateMonth?.trim() || '';
  const day = data.signDateDay?.trim() || '';
  const next = `${escapeHtml(city)}、${escapeHtml(year)}年 ${escapeHtml(month)}月 ${escapeHtml(day)}日`;
  return html.replace(/kota\(katakana\)、年　月　日/gi, next);
}

export function buildSuratTanggunganJpHtml(data: SuratTanggunganFormData): string {
  const a = data.applicant;

  let html = BASE_HTML;
  html = wrapNameStackBlocks(html);
  html = markDomisiliStackTable(html);
  html = boldJpTitle(html);
  html = replaceVillageLine(html, data.villageNameJp || '');
  html = ensureBreakAfterVillageLine(html);
  html = ensureBreakBeforeDomisiliKatakana(html);
  html = replaceAll(html, 'NAMA PESERTA KATAKANA', a.nameKatakana || a.nameJp || a.name || '');
  html = replaceAll(html, 'NAMA PESERTA ROMANJI', a.nameJp || a.name || '');
  html = replaceGenderPlaceholder(html, a.gender || '');
  html = replaceJpDatePlaceholder(html, formatStDobJpNatural(a.dob));
  html = replaceNIKValue(html, a.nik || '');
  html = replaceIssueDatePlaceholder(
    html,
    a.ktpIssueDateJp || formatStDobJpNatural(a.ktpIssueDate) || a.ktpIssueDate || '',
  );
  html = replaceDomisili(html, data);
  html = trimDomisiliSpacerCells(html);
  html = ensureDomisiliTrailingBreaks(html);
  html = injectDependentsTable(html, data);
  html = replaceSignDateLine(html, data);
  // Footer tanda tangan: teks polos di dalam <u>NAMA PESERTA</u>
  html = html.replace(
    /(<u>)NAMA PESERTA(<\/u>)/gi,
    `$1${escapeHtml(a.nameJp || a.name || '') || '\u00A0'}$2`,
  );

  return html;
}
