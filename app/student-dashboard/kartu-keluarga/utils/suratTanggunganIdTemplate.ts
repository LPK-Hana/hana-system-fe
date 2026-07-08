import suratTanggunganTemplate from '@/app/admin-dashboard/contoh-data/template/surat-tanggungan.json';
import type { SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import {
  buildApplicantBorderlessTableHtml,
  buildSignFooterBorderlessHtml,
} from './suratTanggunganIdApplicantLayout';

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

function replaceMany(html: string, key: string, values: string[]): string {
  let i = 0;
  return html.replace(phRegex(key), () => escapeHtml(values[i++] ?? '') || '\u00A0');
}

/** Ganti blok paragraf+tab data pemohon dengan tabel tanpa garis 3 kolom */
function injectApplicantLayout(html: string, data: SuratTanggunganFormData): string {
  const applicantHtml = buildApplicantBorderlessTableHtml(data);
  const re =
    /(Kepala Desa\/Kelurahan<\/span><\/p>)([\s\S]*?)(<p[^>]*>[\s\S]*?Dengan ini saya menyatakan)/i;
  if (!re.test(html)) return html;
  return html.replace(re, `$1${applicantHtml}$3`);
}

/** Ganti footer berbasis tab dengan tabel tanpa garis */
function injectSignFooter(html: string, data: SuratTanggunganFormData): string {
  const footerHtml = buildSignFooterBorderlessHtml(data);
  const re =
    /(<p>[\s\S]*?(&lt;tgl&gt;|<tgl>)[\s\S]*?<\/p>)(\s*<p>[\s\S]*?Legalisasi[\s\S]*?<\/p>)(\s*<p[^>]*>[\s\S]*?<\/p>){0,4}(\s*<p[^>]*>[\s\S]*?(&lt;nama-peserta-romanji&gt;|<nama-peserta-romanji>)[\s\S]*?<\/p>)\s*$/i;
  if (!re.test(html)) return html;
  return html.replace(re, footerHtml);
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
  const dependents = data.dependents.length > 0 ? data.dependents : [];
  const rowCount = Math.max(dependents.length, 2);

  let html = injectApplicantLayout(BASE_HTML, data);
  html = expandDependentRows(html, rowCount);

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
  html = replaceMany(
    html,
    'tgl-lahir',
    dependents.map((d) => d.dob || ''),
  );

  html = injectSignFooter(html, data);

  return html;
}
