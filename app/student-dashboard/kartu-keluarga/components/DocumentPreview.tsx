import React from 'react';
import { KkFormData } from '../types';
import { resolveJpEnumField, resolveJpRomanjiField, translateToId, translateToJp } from '../utils/translations';
import { KK_FONT_ID, KK_FONT_JP } from '../utils/kkFonts';
import { getKkPageSize } from '../utils/kkPageSize';
import {
  formatJpCalendarDate,
  formatJpDisplayName,
  formatJpIssueDate,
} from '../utils/kkJpFormat';

const BSRE_DISCLAIMER_JP =
  'この書類は、BSSNの電子認証センター（BSrE）によって発行された電子証明書を使用して電子署名されています。';

/** Ukuran font JP (pt) — selaras template Word */
const JP_INK = '#000000';
const JP_FONT_TITLE = '26pt';
const JP_FONT_BASIC = '13pt';
const JP_FONT_HEADER_NO = '14pt';
const JP_FONT_TABLE_HEAD = '14pt';
const JP_FONT_TABLE_HEAD_SUB = '12pt';
const JP_FONT_TABLE_CELL = '10.5pt';
const JP_FONT_ISSUE_DATE = '13pt';
const JP_FONT_SETAI = '16pt';
const JP_FONT_OFFICIAL_TITLE = '13pt';
const JP_FONT_FOOTER_NAME = '13pt';
const JP_FONT_SIGNATURE_LABEL = '12.5pt';
const JP_FONT_NIP = '12.5pt';
const JP_FONT_DISCLAIMER = '8.5pt';

const ID_PAGE_PADDING = '24px 32px 16px 32px';
const JP_PAGE_PADDING = '36px 45px 20px 40px';

const cellPad = (paddingLeft = '2px') => ({
  paddingTop: '3px',
  paddingRight: '2px',
  paddingBottom: '3px',
  paddingLeft,
});

const TABLE_CELL = {
  border: '1px solid #000' as const,
  ...cellPad('2px'),
};

const TABLE_HEAD = {
  ...TABLE_CELL,
  background: '#f5f5f5',
  fontWeight: 'bold' as const,
};

const JP_TABLE_HEAD = {
  ...TABLE_CELL,
  border: `1px solid ${JP_INK}`,
  background: '#fff',
  fontWeight: 'bold' as const,
  fontSize: JP_FONT_TABLE_HEAD,
  color: JP_INK,
  lineHeight: '1.15',
  paddingTop: '6px',
  paddingBottom: '6px',
  textAlign: 'center' as const,
};

const JP_TABLE_CELL = {
  ...TABLE_CELL,
  border: `1px solid ${JP_INK}`,
  fontSize: JP_FONT_TABLE_CELL,
  fontWeight: 600,
  color: JP_INK,
  lineHeight: '1.1',
  paddingTop: '2px',
  paddingBottom: '2px',
  textAlign: 'left' as const,
  ...cellPad('4px'),
};

const JP_TABLE_CELL_NO = {
  ...JP_TABLE_CELL,
  textAlign: 'center' as const,
  ...cellPad('2px'),
  fontWeight: 'bold' as const,
};

const TABLE_ROW_H = '16px';
const JP_TABLE1_ROW_H = '24px';
const JP_TABLE2_ROW_H = '26px';
/** ~x883 pada contoh-kk.pdf — di atas akhir kalimat 電子署名されています */
const JP_FOOTER_SETAI_LEFT = '58%';

/** Lebar kolom No. tabel JP — spacer info dasar agar ":" sejajar di atas 氏名 */
const JP_COL_NO_W = '2.2%';
/** Dikalibrasi dari contoh-kk.pdf (label → ":" di x≈217) */
const JP_INFO_LABEL_W = '138px';
const JP_INFO_RIGHT_LABEL_W = '70px';

interface DocumentPreviewProps {
  activeMobileTab: 'edit' | 'preview';
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentScale: number;
  viewLanguage: 'id' | 'jp';
  formData: KkFormData;
  printAreaId?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  activeMobileTab,
  containerRef,
  currentScale,
  viewLanguage,
  formData,
  printAreaId = 'kk-print-area',
}) => {
  const { wPx: pageW, hPx: pageH } = getKkPageSize(viewLanguage);
  const isJp = viewLanguage === 'jp';
  const jpKepalaName = resolveJpRomanjiField(formData.basic.kepalaKeluargaJp, formData.basic.kepalaKeluarga);

  const renderLine = (text: string, width: string, minHeight = '14px', align = 'left', extraProps = {}) => {
    if (text) {
      return (
        <span style={{ display: 'inline-block', width, textAlign: align as any, minHeight, borderBottom: '1px solid transparent', padding: '0 4px', boxSizing: 'border-box', wordBreak: 'break-word', overflowWrap: 'anywhere', ...extraProps }}>
          {text}
        </span>
      );
    }
    return <span style={{ display: 'inline-block', width, borderBottom: '1px solid #000', minHeight, ...extraProps }}></span>;
  };

  const renderFlexValue = (text: string, minHeight = '14px', extraProps = {}) => {
    if (text) {
      return (
        <span style={{ flex: 1, minWidth: 0, minHeight, wordBreak: 'break-word', overflowWrap: 'anywhere', padding: '0 2px', ...extraProps }}>
          {text}
        </span>
      );
    }
    return <span style={{ flex: 1, minWidth: 0, borderBottom: '1px solid #000', minHeight, ...extraProps }}></span>;
  };

  const formatJapaneseDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';
    return formatJpCalendarDate(dateStr);
  };

  const formatJpGender = (genderJp?: string, gender?: string) => {
    const raw = translateToJp('gender', genderJp || gender || '');
    if (raw === '男') return '男性';
    if (raw === '女') return '女性';
    return raw || '-';
  };

  const formatMarriageDate = (dateStr: string | undefined, lang: 'id' | 'jp') => {
    if (!dateStr || dateStr.trim() === '' || dateStr === '-') return '-';
    if (lang === 'jp') return formatJapaneseDate(dateStr);
    return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  };

  const renderJpInfoRow = (label: string, value: string, labelWidth: string) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
      <span style={{ width: labelWidth, flexShrink: 0, textAlign: 'right' }}>{label}</span>
      <span style={{ flexShrink: 0 }}>:</span>
      <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere', padding: '0 2px' }}>
        {value || '\u00A0'}
      </span>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`
        ${activeMobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}
        flex-1 flex items-start justify-center overflow-auto min-h-[500px] lg:min-h-0 lg:h-full bg-slate-100/50 border border-slate-200/60 rounded-2xl p-4 lg:p-6 print:border-none print:bg-transparent print:p-0 print:m-0 relative
      `}
    >
      <div
        style={{
          width: pageW * currentScale,
          height: pageH * currentScale,
          flexShrink: 0,
          position: 'relative',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          margin: '0 auto',
        }}
        className="print:!w-auto print:!h-auto print:!m-0"
      >
        <div
          id={printAreaId}
          data-kk-variant={viewLanguage}
          className="kk-a4 bg-white shadow-xl ring-1 ring-black/[0.08] rounded-sm print:shadow-none print:ring-0"
          style={{
            width: pageW,
            height: pageH,
            transform: `scale(${currentScale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            padding: isJp ? JP_PAGE_PADDING : ID_PAGE_PADDING,
            boxSizing: 'border-box',
            overflow: 'hidden',
            fontFamily: isJp ? KK_FONT_JP : KK_FONT_ID,
            color: isJp ? JP_INK : '#000',
            fontSize: isJp ? JP_FONT_BASIC : '11px',
            fontWeight: isJp ? 600 : undefined,
            lineHeight: isJp ? '1.2' : '1.15',
            border: viewLanguage === 'id' ? '3px double #1e3a8a' : 'none',
            WebkitTextSizeAdjust: '100%',
            textRendering: isJp ? 'geometricPrecision' : 'optimizeLegibility',
            WebkitFontSmoothing: isJp ? 'auto' : 'antialiased',
            MozOsxFontSmoothing: isJp ? 'auto' : 'grayscale',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            imageRendering: '-webkit-optimize-contrast',
          }}
        >
          {/* ─── HEADER ─── */}
          {viewLanguage === 'id' ? (
            <div style={{ textAlign: 'center', marginBottom: '8px', position: 'relative' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.2em', color: '#1e3a8a', marginBottom: '4px' }}>
                KARTU KELUARGA
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <span>No.</span>
                {renderLine(formData.header.number, '220px', '16px', 'center', { fontWeight: 'bold', fontSize: '13px' })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '14px', position: 'relative' }}>
              <div style={{ fontSize: JP_FONT_TITLE, fontWeight: 'bold', color: JP_INK, letterSpacing: '0.55em', marginBottom: '6px', paddingLeft: '0.55em' }}>
                戸籍謄本
              </div>
              <div style={{ fontSize: JP_FONT_HEADER_NO, fontWeight: 'bold', color: JP_INK, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <span>No.</span>
                <span>{formData.header.number || renderLine('', '320px', '28px', 'center')}</span>
              </div>
            </div>
          )}

          {/* ─── BASIC INFO ─── */}
          {viewLanguage === 'id' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '6px', fontSize: '10px', fontWeight: 'bold', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: '58%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '130px', flexShrink: 0 }}>Nama Kepala Keluarga</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.kepalaKeluarga)}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '130px', flexShrink: 0 }}>Alamat</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.alamat)}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '130px', flexShrink: 0 }}>RT/RW</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.rtRw)}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '130px', flexShrink: 0 }}>Desa/Kelurahan</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.kelurahan)}
                </div>
              </div>

              <div style={{ flex: '0 0 auto', width: '32%', marginLeft: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '100px', flexShrink: 0 }}>Kecamatan</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.kecamatan)}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '100px', flexShrink: 0 }}>Kabupaten/Kota</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.kabKota)}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '100px', flexShrink: 0 }}>Kode Pos</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.kodePos)}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, gap: '4px' }}>
                  <span style={{ width: '100px', flexShrink: 0 }}>Provinsi</span>
                  <span style={{ flexShrink: 0 }}>:</span>
                  {renderFlexValue(formData.basic.provinsi)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px', fontSize: JP_FONT_BASIC, fontWeight: 'bold', color: JP_INK }}>
              <div style={{ width: JP_COL_NO_W, flexShrink: 0 }} aria-hidden="true" />
              <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: '56%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {renderJpInfoRow('世帯主名', resolveJpRomanjiField(formData.basic.kepalaKeluargaJp, formData.basic.kepalaKeluarga), JP_INFO_LABEL_W)}
                {renderJpInfoRow('住所', resolveJpRomanjiField(formData.basic.alamatJp, formData.basic.alamat), JP_INFO_LABEL_W)}
                {renderJpInfoRow('隣組／町内会', formData.basic.rtRwJp || formData.basic.rtRw, JP_INFO_LABEL_W)}
                {renderJpInfoRow('郵便番号', formData.basic.kodePos, JP_INFO_LABEL_W)}
              </div>
              <div style={{ flex: '0 0 auto', width: '32%', marginLeft: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {renderJpInfoRow('村／町', resolveJpRomanjiField(formData.basic.kelurahanJp, formData.basic.kelurahan), JP_INFO_RIGHT_LABEL_W)}
                {renderJpInfoRow('郡', resolveJpRomanjiField(formData.basic.kecamatanJp, formData.basic.kecamatan), JP_INFO_RIGHT_LABEL_W)}
                {renderJpInfoRow('県／市', resolveJpRomanjiField(formData.basic.kabKotaJp, formData.basic.kabKota), JP_INFO_RIGHT_LABEL_W)}
                {renderJpInfoRow('州', resolveJpRomanjiField(formData.basic.provinsiJp, formData.basic.provinsi), JP_INFO_RIGHT_LABEL_W)}
              </div>
            </div>
          )}

          {/* ─── TABLE 1 ─── */}
          {viewLanguage === 'id' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', tableLayout: 'fixed', fontSize: '8.5px', textAlign: 'center', marginBottom: '4px' }}>
              <colgroup>
                <col style={{ width: '3%' }} />
                <col style={{ width: '19%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '9%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                  <th style={TABLE_HEAD}>NO</th>
                  <th style={TABLE_HEAD}>NAMA LENGKAP<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(1)</span></th>
                  <th style={TABLE_HEAD}>NIK<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(2)</span></th>
                  <th style={TABLE_HEAD}>JENIS KELAMIN<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(3)</span></th>
                  <th style={TABLE_HEAD}>TEMPAT LAHIR<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(4)</span></th>
                  <th style={TABLE_HEAD}>TANGGAL LAHIR<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(5)</span></th>
                  <th style={TABLE_HEAD}>AGAMA<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(6)</span></th>
                  <th style={TABLE_HEAD}>PENDIDIKAN<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(7)</span></th>
                  <th style={TABLE_HEAD}>JENIS PEKERJAAN<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(8)</span></th>
                  <th style={TABLE_HEAD}>GOL. DARAH<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(9)</span></th>
                </tr>
              </thead>
              <tbody>
                {formData.members.map((row, idx) => (
                  <tr key={idx} style={{ height: TABLE_ROW_H }}>
                    <td style={{ ...TABLE_CELL, fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ ...TABLE_CELL, ...cellPad(row.name ? '4px' : '2px'), textAlign: row.name ? 'left' : 'center', fontSize: '8px' }}>{row.name || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.nik || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{translateToId('gender', row.gender) || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.pob || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.dob ? row.dob.split('T')[0] : '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{translateToId('religion', row.religion) || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.education || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.occupation || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{translateToId('bloodType', row.bloodType || '') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${JP_INK}`, tableLayout: 'fixed', marginBottom: '8px' }}>
              <colgroup>
                <col style={{ width: '2.2%' }} />
                <col style={{ width: '19.6%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '7.9%' }} />
                <col style={{ width: '11.8%' }} />
                <col style={{ width: '10.5%' }} />
                <col style={{ width: '9.9%' }} />
                <col style={{ width: '8.6%' }} />
                <col style={{ width: '9.2%' }} />
                <col style={{ width: '9.3%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={JP_TABLE_HEAD}>No.</th>
                  <th style={JP_TABLE_HEAD}>氏名<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(1)</span></th>
                  <th style={JP_TABLE_HEAD}>登録番号<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(2)</span></th>
                  <th style={JP_TABLE_HEAD}>性別<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(3)</span></th>
                  <th style={JP_TABLE_HEAD}>出生地<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(4)</span></th>
                  <th style={JP_TABLE_HEAD}>生年月日<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(5)</span></th>
                  <th style={JP_TABLE_HEAD}>宗教<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(6)</span></th>
                  <th style={JP_TABLE_HEAD}>学歴<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(7)</span></th>
                  <th style={JP_TABLE_HEAD}>職業<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(8)</span></th>
                  <th style={JP_TABLE_HEAD}>血液型<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(9)</span></th>
                </tr>
              </thead>
              <tbody>
                {formData.members.map((row, idx) => {
                  const name = resolveJpRomanjiField(row.nameJp, row.name);
                  const pob = resolveJpRomanjiField(row.pobJp, row.pob);
                  return (
                    <tr key={idx} style={{ height: JP_TABLE1_ROW_H }}>
                      <td style={JP_TABLE_CELL_NO}>{idx + 1}</td>
                      <td style={JP_TABLE_CELL}>{name ? formatJpDisplayName(name) : '-'}</td>
                      <td style={JP_TABLE_CELL}>{row.nik || '-'}</td>
                      <td style={JP_TABLE_CELL}>{formatJpGender(row.genderJp, row.gender)}</td>
                      <td style={JP_TABLE_CELL}>{pob ? formatJpDisplayName(pob) : '-'}</td>
                      <td style={JP_TABLE_CELL}>{formatJapaneseDate(row.dob)}</td>
                      <td style={JP_TABLE_CELL}>{row.religionJp || translateToJp('religion', row.religion) || '-'}</td>
                      <td style={JP_TABLE_CELL}>{row.educationJp || translateToJp('education', row.education) || '-'}</td>
                      <td style={JP_TABLE_CELL}>{row.occupationJp || translateToJp('occupation', row.occupation) || '-'}</td>
                      <td style={JP_TABLE_CELL}>{row.bloodTypeJp || translateToJp('bloodType', row.bloodType || '') || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ─── TABLE 2 ─── */}
          {viewLanguage === 'id' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', tableLayout: 'fixed', fontSize: '8.5px', textAlign: 'center', marginBottom: '6px' }}>
              <colgroup>
                <col style={{ width: '3%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                  <th rowSpan={2} style={TABLE_HEAD}>NO</th>
                  <th rowSpan={2} style={TABLE_HEAD}>STATUS PERKAWINAN<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(10)</span></th>
                  <th rowSpan={2} style={TABLE_HEAD}>TANGGAL PERKAWINAN<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(11)</span></th>
                  <th rowSpan={2} style={TABLE_HEAD}>HUBUNGAN KELUARGA<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(12)</span></th>
                  <th rowSpan={2} style={TABLE_HEAD}>KEWARGANEGARAAN<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(13)</span></th>
                  <th colSpan={2} style={TABLE_HEAD}>DOKUMEN IMIGRASI</th>
                  <th colSpan={2} style={TABLE_HEAD}>NAMA ORANG TUA</th>
                </tr>
                <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                  <th style={TABLE_HEAD}>NO. PASPOR<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(14)</span></th>
                  <th style={TABLE_HEAD}>NO. KITAS / KITAP<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(15)</span></th>
                  <th style={TABLE_HEAD}>NAMA AYAH<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(16)</span></th>
                  <th style={TABLE_HEAD}>NAMA IBU<br /><span style={{ fontWeight: 'normal', fontSize: '7.5px' }}>(17)</span></th>
                </tr>
              </thead>
              <tbody>
                {formData.members.map((row, idx) => (
                  <tr key={idx} style={{ height: TABLE_ROW_H }}>
                    <td style={{ ...TABLE_CELL, fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{translateToId('maritalStatus', row.maritalStatus) || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{formatMarriageDate(row.marriageDate, 'id')}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{translateToId('relationship', row.relationship) || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{translateToId('nationality', row.nationality) || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.passport || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.kitas || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.father || '-'}</td>
                    <td style={{ ...TABLE_CELL, fontSize: '8px' }}>{row.mother || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${JP_INK}`, tableLayout: 'fixed', marginBottom: '10px' }}>
              <colgroup>
                <col style={{ width: '2.9%' }} />
                <col style={{ width: '6.8%' }} />
                <col style={{ width: '13.1%' }} />
                <col style={{ width: '8.2%' }} />
                <col style={{ width: '13.7%' }} />
                <col style={{ width: '9.3%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '15.2%' }} />
                <col style={{ width: '22.8%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} style={JP_TABLE_HEAD}>No.</th>
                  <th rowSpan={2} style={JP_TABLE_HEAD}>婚姻<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(10)</span></th>
                  <th rowSpan={2} style={JP_TABLE_HEAD}>結婚日<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(11)</span></th>
                  <th rowSpan={2} style={JP_TABLE_HEAD}>家族関係<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(12)</span></th>
                  <th rowSpan={2} style={JP_TABLE_HEAD}>国籍<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(13)</span></th>
                  <th colSpan={2} style={JP_TABLE_HEAD}>入国管理局書類</th>
                  <th colSpan={2} style={JP_TABLE_HEAD}>両親の氏名</th>
                </tr>
                <tr>
                  <th style={JP_TABLE_HEAD}>旅券番号<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(14)</span></th>
                  <th style={JP_TABLE_HEAD}>KITAP番号<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(15)</span></th>
                  <th style={JP_TABLE_HEAD}>父<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(16)</span></th>
                  <th style={JP_TABLE_HEAD}>母<br /><span style={{ fontWeight: 600, fontSize: JP_FONT_TABLE_HEAD_SUB, color: JP_INK }}>(17)</span></th>
                </tr>
              </thead>
              <tbody>
                {formData.members.map((row, idx) => {
                  const father = resolveJpRomanjiField(row.fatherJp, row.father);
                  const mother = resolveJpRomanjiField(row.motherJp, row.mother);
                  return (
                    <tr key={idx} style={{ height: JP_TABLE2_ROW_H }}>
                      <td style={JP_TABLE_CELL_NO}>{idx + 1}</td>
                      <td style={JP_TABLE_CELL}>{row.maritalStatusJp || translateToJp('maritalStatus', row.maritalStatus) || '-'}</td>
                      <td style={JP_TABLE_CELL}>{formatMarriageDate(row.marriageDateJp || row.marriageDate, 'jp')}</td>
                      <td style={JP_TABLE_CELL}>{resolveJpEnumField(row.relationshipJp, row.relationship, 'relationship') || '-'}</td>
                      <td style={JP_TABLE_CELL}>{row.nationalityJp || translateToJp('nationality', row.nationality) || '-'}</td>
                      <td style={JP_TABLE_CELL}>{row.passport || '-'}</td>
                      <td style={JP_TABLE_CELL}>{row.kitas || '-'}</td>
                      <td style={JP_TABLE_CELL}>{father ? formatJpDisplayName(father) : '-'}</td>
                      <td style={JP_TABLE_CELL}>{mother ? formatJpDisplayName(mother) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ─── FOOTER ─── */}
          {viewLanguage === 'id' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', marginTop: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', lineHeight: 1.4, width: '30%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', flexShrink: 0 }}>Dikeluarkan Tanggal</span>
                  <span style={{ marginRight: '8px' }}>:</span>
                  <span style={{ whiteSpace: 'nowrap' }}>
                    {formData.footer.issueDate ? formData.footer.issueDate + ' ' : <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>}
                    {formData.footer.issueMonth ? formData.footer.issueMonth + ' ' : <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>}
                    {formData.footer.issueYear ? formData.footer.issueYear : <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>}
                  </span>
                </div>
                {[
                  ['Lembar I', 'Kepala Keluarga'],
                  ['Lembar II', 'RT/RW'],
                  ['Lembar III', 'Desa/Kelurahan'],
                  ['Lembar IV', 'Kecamatan'],
                ].map(([num, use]) => (
                  <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '100px', flexShrink: 0 }}>{num}</span>
                    <span style={{ marginRight: '8px' }}>:</span>
                    <span>{use}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%' }}>
                <span style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '24px' }}>KEPALA KELUARGA</span>
                <span style={{ fontSize: '10px', marginBottom: '8px' }}>Tanda Tangan / Cap Ibu Jari</span>
                <div style={{ width: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', minHeight: '14px', marginBottom: '2px', textDecoration: 'underline' }}>
                    {formData.basic.kepalaKeluarga || <>&nbsp;</>}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%' }}>
                <span style={{ fontWeight: 'bold', fontSize: '11px', textAlign: 'center', lineHeight: '1.2' }}>
                  KEPALA DINAS KEPENDUDUKAN<br />DAN PENCATATAN SIPIL
                </span>
                <div style={{ height: '30px', margin: '8px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', textDecoration: 'underline' }}>{formData.footer.kepalaDinas || <>&nbsp;</>}</span>
                </div>
                <div style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ borderTop: '1px solid #000', width: '100%', paddingTop: '4px', fontSize: '10.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>NIP. </span>
                    {renderLine(formData.footer.nip, '130px', '12px', 'left', { marginLeft: '6px' })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginTop: '28px', position: 'relative', width: '100%' }}>
                {/* Baris 1: 発行日 | 世帯主 | judul pejabat */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontSize: JP_FONT_ISSUE_DATE, fontWeight: 'bold', color: JP_INK }}>
                    <span>発行日</span>
                    <span style={{ margin: '0 6px' }}>:</span>
                    <span style={{ border: `1px solid ${JP_INK}`, padding: '5px 10px', display: 'inline-block' }}>
                      {formatJpIssueDate(formData.footer.issueYear, formData.footer.issueMonth, formData.footer.issueDate)}
                    </span>
                  </div>
                  <div style={{ width: '35%', textAlign: 'center', fontSize: JP_FONT_OFFICIAL_TITLE, fontWeight: 'bold', color: JP_INK, lineHeight: 1.35 }}>
                    <div>第１地域住民登録</div>
                    <div>戸籍記録 UPTD 所長</div>
                  </div>
                </div>
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: JP_FOOTER_SETAI_LEFT,
                  transform: 'translateX(-50%)',
                  fontSize: JP_FONT_SETAI,
                  fontWeight: 'bold',
                  color: JP_INK,
                  whiteSpace: 'nowrap',
                }}>
                  世帯主
                </span>

                {/* Baris 2: nama sejajar */}
                <div style={{ position: 'relative', marginTop: '56px', minHeight: '1.3em' }}>
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: JP_FOOTER_SETAI_LEFT,
                    transform: 'translateX(-50%)',
                    fontSize: JP_FONT_FOOTER_NAME,
                    fontWeight: 'bold',
                    color: JP_INK,
                    textDecoration: 'underline',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                  }}>
                    {jpKepalaName ? formatJpDisplayName(jpKepalaName) : '\u00A0'}
                  </span>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '35%', textAlign: 'center' }}>
                    <span style={{
                      fontSize: JP_FONT_FOOTER_NAME,
                      fontWeight: 'bold',
                      color: JP_INK,
                      textDecoration: 'underline',
                      lineHeight: 1.3,
                      padding: '0 8px',
                    }}>
                      {formData.footer.kepalaDinas || '\u00A0'}
                    </span>
                  </div>
                </div>

                {/* Baris 3: 署名／拇印 | 公務員番号 sejajar */}
                <div style={{ position: 'relative', marginTop: '22px', height: '1.3em' }}>
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: JP_FOOTER_SETAI_LEFT,
                    transform: 'translateX(-50%)',
                    fontSize: JP_FONT_SIGNATURE_LABEL,
                    fontWeight: 'bold',
                    color: JP_INK,
                    whiteSpace: 'nowrap',
                  }}>
                    署名／拇印
                  </span>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '35%', textAlign: 'center', fontSize: JP_FONT_NIP, fontWeight: 'bold', color: JP_INK }}>
                    公務員番号：{formData.footer.nip || '\u00A0'}
                  </div>
                </div>
              </div>

              <div
                role="note"
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '40px',
                  right: '45px',
                  margin: 0,
                  textAlign: 'center',
                  fontSize: JP_FONT_DISCLAIMER,
                  lineHeight: 1.35,
                  fontWeight: 'bold',
                  color: JP_INK,
                  opacity: 1,
                  WebkitFontSmoothing: 'subpixel-antialiased',
                  MozOsxFontSmoothing: 'auto',
                  textRendering: 'auto',
                  printColorAdjust: 'exact',
                }}
              >
                {BSRE_DISCLAIMER_JP}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
