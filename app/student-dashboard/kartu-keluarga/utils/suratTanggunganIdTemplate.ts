import suratTanggunganTemplate from '@/app/admin-dashboard/contoh-data/template/Surat_Tanggungan_Indo.lpk-hana-template.json';
import type { SuratTanggunganFormData } from '../types/suratTanggunganTypes';

export const SURAT_TANGGUNGAN_ID_TEMPLATE = suratTanggunganTemplate.template;

export const SURAT_TANGGUNGAN_ID_MARGINS = {
  top: SURAT_TANGGUNGAN_ID_TEMPLATE.margins.top,
  right: SURAT_TANGGUNGAN_ID_TEMPLATE.margins.right,
  bottom: SURAT_TANGGUNGAN_ID_TEMPLATE.margins.bottom,
  left: SURAT_TANGGUNGAN_ID_TEMPLATE.margins.left,
} as const;

const BASE_HTML = SURAT_TANGGUNGAN_ID_TEMPLATE.pages[0]?.html ?? '';

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

function replaceMany(html: string, key: string, values: string[]): string {
  let i = 0;
  return html.replace(phRegex(key), () => escapeHtml(values[i++] ?? '') || '\u00A0');
}

function formatGenderDisplay(gender: string): string {
  const g = gender.toUpperCase();
  if (g.startsWith('L') || g.includes('LAKI') || g === 'M' || g === 'L') return 'Laki-laki';
  if (g.startsWith('P') || g.includes('PEREMPUAN') || g === 'F' || g === 'P') return 'Perempuan';
  return gender;
}

function replaceDomisili(html: string, domisili: string): string {
  const value = escapeHtml(domisili) || '\u00A0';
  return html.replace(/DESA,\s*KECAMATAN,\s*KAB\/KOTA,\s*PROVINSI(?:\s*ALFABET)?/gi, value);
}

function replaceSignDatePlaceholder(html: string, data: SuratTanggunganFormData): string {
  const dateText = data.signDateId?.trim() || 'tgl bln thn';
  return html.replace(/tgl\s+bln\s+thn/gi, dateText);
}

function replaceNikValue(html: string, nik: string): string {
  const safe = escapeHtml(nik) || '\u00A0';
  return html.replace(/:\s*(&lt;nik&gt;|<nik>)/gi, `: ${safe}`);
}

function expandDependentRows(html: string, rowCount: number): string {
  const rowRe = /<tr>[\s\S]*?(&lt;hubungan&gt;|<hubungan>)[\s\S]*?<\/tr>/gi;
  const rows = html.match(rowRe) ?? [];
  if (rows.length === 0 || rowCount <= rows.length) return html;

  const lastRow = rows[rows.length - 1];
  let extra = '';
  for (let i = rows.length; i < rowCount; i++) {
    const no = i + 1;
    extra += lastRow.replace(
      /(<p[^>]*text-align:\s*center[^>]*>)\s*\d+\s*(<\/p>)/i,
      `$1${no}$2`,
    );
  }

  const lastIndex = html.lastIndexOf(rows[rows.length - 1]);
  if (lastIndex < 0) return html;
  const insertAt = lastIndex + rows[rows.length - 1].length;
  return html.slice(0, insertAt) + extra + html.slice(insertAt);
}

export function buildSuratTanggunganIdHtml(data: SuratTanggunganFormData): string {
  const a = data.applicant;
  const dependents = data.dependents;
  const rowCount = dependents.length;

  let html = expandDependentRows(BASE_HTML, rowCount);

  html = replaceAll(html, 'nama-peserta', a.name || '');
  html = replaceAll(html, 'L/P', formatGenderDisplay(a.gender || ''));
  html = replaceNikValue(html, a.nik || '');
  // Template terbaru pakai <kk> untuk tanggal terbit KK; <tgl> tetap didukung.
  html = replaceAll(html, 'kk', a.ktpIssueDate || '');
  html = replaceAll(html, 'tgl', a.ktpIssueDate || '');
  html = replaceDomisili(html, a.domisili || '');

  html = replaceMany(html, 'tgl-lahir', [
    a.dob || '',
    ...dependents.map((d) => d.dob || ''),
  ]);

  html = replaceMany(
    html,
    'hubungan',
    dependents.map((d) => d.relationship || ''),
  );
  html = replaceMany(
    html,
    'nama',
    dependents.map((d) => d.name || ''),
  );

  html = replaceAll(html, 'kota', (data.locationId || '').trim());
  html = replaceSignDatePlaceholder(html, data);

  return html;
}
