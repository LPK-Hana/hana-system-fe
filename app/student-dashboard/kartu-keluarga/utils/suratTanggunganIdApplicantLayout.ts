import type { SuratTanggunganFormData } from '../types/suratTanggunganTypes';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function val(value: string): string {
  return escapeHtml(value) || '&nbsp;';
}

/** Satu baris label ： nilai — 3 kolom tanpa garis */
function field3Col(label: string, value: string, labelWidthPx: number): string {
  return `<table class="st-borderless-table st-field-3col" style="width:100%;border-collapse:collapse;border:none;">
<tr>
<td class="st-label-col" style="width:${labelWidthPx}px;vertical-align:top;border:none;padding:0 0 3px 0;">${escapeHtml(label)}</td>
<td class="st-colon-col" style="width:16px;vertical-align:top;border:none;padding:0 0 3px 0;text-align:center;">：</td>
<td class="st-value-col" style="vertical-align:top;border:none;padding:0 0 3px 0;white-space:normal;overflow-wrap:break-word;word-break:break-word;">${val(value)}</td>
</tr>
</table>`;
}

/** Blok data pemohon — titik dua sejajar, teks panjang wrap di kolom nilai */
export function buildApplicantBorderlessTableHtml(data: SuratTanggunganFormData): string {
  const a = data.applicant;
  const domisili = (a.domisili || '').toUpperCase();
  const penerbit = 'Dinas Kependudukan dan Pencatatan Sipil';

  return `<table class="st-borderless-table st-applicant-grid" style="width:100%;border-collapse:collapse;border:none;margin:6px 0 10px;font-size:10.5pt;">
<tbody>
<tr>
<td style="width:50%;vertical-align:top;border:none;padding:0 10px 0 0;">${field3Col('Nama', a.name, 70)}</td>
<td style="width:50%;vertical-align:top;border:none;padding:0;">${field3Col('Jenis Kelamin', a.gender, 96)}</td>
</tr>
<tr>
<td style="vertical-align:top;border:none;padding:0 10px 0 0;">${field3Col('Tgl Lahir', a.dob, 70)}</td>
<td style="vertical-align:top;border:none;padding:0;">${field3Col('Kewarganegaraan', a.nationality || 'Indonesia', 96)}</td>
</tr>
<tr>
<td style="width:34%;vertical-align:top;border:none;padding:0 8px 0 0;">${field3Col('NIK', a.nik, 56)}</td>
<td style="width:30%;vertical-align:top;border:none;padding:0 8px 0 0;">${field3Col('Tgl Terbit KTP', a.ktpIssueDate, 78)}</td>
<td style="width:36%;vertical-align:top;border:none;padding:0;">${field3Col('Penerbit KTP', penerbit, 72)}</td>
</tr>
<tr>
<td colspan="3" style="vertical-align:top;border:none;padding:0;">${field3Col('Domisili', domisili, 70)}</td>
</tr>
</tbody>
</table>`;
}

export function formatSignDateLine(data: SuratTanggunganFormData): string {
  const loc = (data.locationId || '').trim().toUpperCase();
  const day = data.signDateDay?.trim() || 'Tgl';
  const month = data.signDateMonth?.trim() || 'Bln';
  const year = data.signDateYear?.trim() || 'Thn';
  return loc ? `${loc} , ${day} ${month} ${year}` : `${day} ${month} ${year}`;
}

/** Footer tanda tangan — tanpa tab, pakai tabel tanpa garis */
export function buildSignFooterBorderlessHtml(data: SuratTanggunganFormData): string {
  const a = data.applicant;
  const signDate = formatSignDateLine(data);

  return `<table class="st-borderless-table st-sign-footer" style="width:100%;border-collapse:collapse;border:none;margin-top:12px;font-size:10.5pt;">
<tbody>
<tr>
<td style="width:42%;vertical-align:top;border:none;padding:0;line-height:1.45;">
<div>Legalisasi (Ttd dan Stempel)</div>
<div>Kepala Desa/Kelurahan</div>
</td>
<td style="width:58%;vertical-align:top;border:none;padding:0;">
<table class="st-borderless-table" style="width:100%;border-collapse:collapse;border:none;">
<tr>
<td style="border:none;padding:0;text-align:right;padding-right:4px;margin-bottom:2px;">${val(signDate)}</td>
</tr>
<tr>
<td style="border:none;padding:0;text-align:center;padding-bottom:40px;">Pemohon</td>
</tr>
<tr>
<td style="border:none;padding:0;text-align:center;font-weight:bold;text-decoration:underline;letter-spacing:0.02em;">${val(a.name)}</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>`;
}
