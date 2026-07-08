'use client';

import React, { useEffect, useRef } from 'react';
import { SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import {
  getSuratTanggunganPageSize,
  ST_CONTENT_SCALE,
  ST_FONT_BODY_PT,
  ST_FONT_FURIGANA_PT,
  ST_FONT_TITLE_PT,
  ST_INNER_H_PX,
  ST_INNER_W_PX,
  ST_JP_LABEL_W,
  ST_JP_LABEL_W_SHORT,
  ST_MARGIN_JP,
  ST_PAGE_GAP_PX,
  stMarginPadding,
} from '../utils/suratTanggunganPageSize';
import { SURAT_TANGGUNGAN_ID_MARGINS } from '../utils/suratTanggunganIdTemplate';
import { ST_FONT_ID, ST_FONT_JP } from '../utils/suratTanggunganFonts';
import { SuratTanggunganIdTemplatePage } from './SuratTanggunganIdTemplatePage';

interface SuratTanggunganPreviewProps {
  activeMobileTab: 'edit' | 'preview';
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentScale: number;
  viewLanguage: 'id' | 'jp';
  formData: SuratTanggunganFormData;
}

const TH: React.CSSProperties = {
  border: '1px solid #000',
  padding: '2px 3px',
  fontWeight: 'bold',
  textAlign: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.2,
};

const TD: React.CSSProperties = {
  border: '1px solid #000',
  padding: '2px 4px',
  textAlign: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.2,
};

/** Tanggal JP alami: 2002年 6月 16日 */
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
  return `${+y}年 ${+m}月 ${+d}日`;
}

const PageShell: React.FC<{
  pageNumber: 1 | 2;
  language: 'id' | 'jp';
  active: boolean;
  pageRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}> = ({ pageNumber, language, active, pageRef, children }) => {
  const { wPx, hPx } = getSuratTanggunganPageSize();
  const isJp = language === 'jp';
  const useIdTemplate = pageNumber === 1 && language === 'id';
  const margin = useIdTemplate ? SURAT_TANGGUNGAN_ID_MARGINS : ST_MARGIN_JP;
  const contentScale = useIdTemplate ? 1 : ST_CONTENT_SCALE;
  const innerW = useIdTemplate ? wPx : ST_INNER_W_PX;
  const innerH = useIdTemplate ? hPx : ST_INNER_H_PX;

  return (
    <div
      ref={pageRef}
      data-st-page={pageNumber}
      data-st-lang={language}
      className={`st-a4-page bg-white shadow-xl rounded-sm print:shadow-none transition-shadow ${
        active ? 'ring-2 ring-indigo-400/60' : 'ring-1 ring-black/[0.08]'
      }`}
      style={{
        width: wPx,
        height: hPx,
        boxSizing: 'border-box',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div
        className="st-page-inner"
        style={{
          width: innerW,
          height: innerH,
          transform: contentScale === 1 ? undefined : `scale(${contentScale})`,
          transformOrigin: 'top left',
          boxSizing: 'border-box',
          padding: stMarginPadding(margin),
          fontFamily: isJp ? ST_FONT_JP : ST_FONT_ID,
          color: '#000',
          fontSize: `${ST_FONT_BODY_PT}pt`,
          lineHeight: 1.3,
          WebkitTextSizeAdjust: '100%',
          textRendering: useIdTemplate ? 'optimizeLegibility' : 'geometricPrecision',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Baris info JP — label kanan + ： + nilai */
const JpField: React.FC<{ label: string; value: string; labelW?: number }> = ({
  label,
  value,
  labelW = ST_JP_LABEL_W,
}) => (
  <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0, lineHeight: 1.3 }}>
    <span style={{ width: labelW, flexShrink: 0, textAlign: 'right' }}>{label}</span>
    <span style={{ flexShrink: 0, margin: '0 1px' }}>：</span>
    <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{value || '\u00A0'}</span>
  </div>
);

const JpNameCell: React.FC<{ katakana?: string; name: string }> = ({ katakana, name }) => (
  <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
    {katakana ? (
      <div style={{ fontSize: `${ST_FONT_FURIGANA_PT}pt`, marginBottom: '1px', letterSpacing: '0.03em' }}>
        {katakana}
      </div>
    ) : null}
    <div>{name || '\u00A0'}</div>
  </div>
);

const PageJapanese: React.FC<{ data: SuratTanggunganFormData }> = ({ data }) => {
  const a = data.applicant;
  const loc = data.locationJp || data.locationId || 'スメダン';

  return (
    <>
      <div
        style={{
          textAlign: 'center',
          fontSize: `${ST_FONT_TITLE_PT}pt`,
          fontWeight: 'bold',
          letterSpacing: '0.58em',
          marginBottom: '14px',
          marginRight: '-0.58em',
        }}
      >
        扶　養　証　明　書
      </div>

      <div style={{ marginBottom: '10px' }}>
        {data.villageNameJp ? <span>{data.villageNameJp}</span> : null}
        <span>村　御中</span>
      </div>

      {a.nameKatakana ? (
        <div
          style={{
            fontSize: `${ST_FONT_FURIGANA_PT}pt`,
            lineHeight: 1.15,
            marginBottom: '4px',
            letterSpacing: '0.05em',
          }}
        >
          {a.nameKatakana}
        </div>
      ) : null}

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '6px',
          fontSize: `${ST_FONT_BODY_PT}pt`,
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: '62%', verticalAlign: 'top', padding: '0 8px 1px 0' }}>
              <JpField label="氏名" value={a.nameJp || a.name} />
            </td>
            <td style={{ width: '38%', verticalAlign: 'top', padding: '0 0 1px 0' }}>
              <JpField label="性別" value={a.genderJp || '男'} labelW={ST_JP_LABEL_W_SHORT} />
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: 'top', padding: '0 8px 1px 0' }}>
              <JpField label="生年月日" value={formatStDobJpNatural(a.dob)} />
            </td>
            <td style={{ verticalAlign: 'top', padding: '0 0 1px 0' }}>
              <JpField label="国籍" value={a.nationalityJp || 'インドネシア'} labelW={ST_JP_LABEL_W_SHORT} />
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: 'top', padding: '0 8px 1px 0' }}>
              <JpField label="身分証明書番号" value={a.nik} />
            </td>
            <td style={{ verticalAlign: 'top', padding: '0 0 1px 0' }}>
              <JpField
                label="発行日"
                value={a.ktpIssueDateJp || formatStDobJpNatural(a.ktpIssueDate) || a.ktpIssueDate}
                labelW={ST_JP_LABEL_W_SHORT}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ verticalAlign: 'top', padding: '0 0 1px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1.3 }}>
                <span style={{ width: ST_JP_LABEL_W, flexShrink: 0, textAlign: 'right' }}>発行機関</span>
                <span style={{ margin: '0 1px' }}>：</span>
                <span style={{ flex: 1 }}>
                  人口移動・民事
                  <br />
                  <span style={{ paddingLeft: '0.9em' }}>・市民登録機関</span>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ verticalAlign: 'top', padding: 0 }}>
              {a.domisiliKatakana ? (
                <div
                  style={{
                    fontSize: `${ST_FONT_FURIGANA_PT}pt`,
                    lineHeight: 1.15,
                    marginBottom: '1px',
                    paddingLeft: `${ST_JP_LABEL_W + 12}px`,
                    letterSpacing: '0.02em',
                  }}
                >
                  {a.domisiliKatakana}
                </div>
              ) : null}
              <JpField label="本籍" value={a.domisiliJp || a.domisili} />
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ margin: '8px 0 10px' }}>
        下記の者（扶養者）は私と親族関係にあり、扶養する必要があることを証明いたします。
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: '7%' }}>順</th>
            <th style={{ ...TH, width: '22%' }}>扶養者本人との関係</th>
            <th style={{ ...TH, width: '44%' }}>氏名</th>
            <th style={{ ...TH, width: '27%' }}>生年月日</th>
          </tr>
        </thead>
        <tbody>
          {data.dependents.map((row, idx) => (
            <tr key={idx} style={{ height: '26px' }}>
              <td style={TD}>{idx + 1}</td>
              <td style={TD}>{row.relationshipJp || row.relationship || '\u00A0'}</td>
              <td style={TD}>
                <JpNameCell katakana={row.nameKatakana} name={row.nameJp || row.name} />
              </td>
              <td style={TD}>{formatStDobJpNatural(row.dob) || '\u00A0'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: '0 0 10px', lineHeight: 1.3 }}>
        上記記載は事実であることを証明する。もし間違ったら、法律に関する全責任を負担します。
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '28%', paddingTop: '22px' }}>
          <div>村長の確認</div>
        </div>
        <div style={{ width: '62%', textAlign: 'right' }}>
          <div style={{ marginBottom: '16px' }}>
            <span>{loc}</span>
            <span>　，</span>
            <span>{data.signDateYear || '　　'}</span>
            <span>　年　</span>
            <span>{data.signDateMonth || '　'}</span>
            <span>　月　</span>
            <span>{data.signDateDay || '　'}</span>
            <span>　日</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                border: '1px solid #000',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8pt',
                flexShrink: 0,
                marginBottom: '2px',
              }}
            >
              印
            </div>
            <div style={{ textAlign: 'center', minWidth: '210px' }}>
              <div style={{ marginBottom: '30px', textAlign: 'center' }}>作成者</div>
              <div
                style={{
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                }}
              >
                {a.nameJp || a.name || '\u00A0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const SuratTanggunganPreview: React.FC<SuratTanggunganPreviewProps> = ({
  activeMobileTab,
  containerRef,
  currentScale,
  viewLanguage,
  formData,
}) => {
  const { wPx: pageW, hPx: pageH } = getSuratTanggunganPageSize();
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const totalH = pageH * 2 + ST_PAGE_GAP_PX;

  useEffect(() => {
    const target = viewLanguage === 'id' ? page1Ref.current : page2Ref.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [viewLanguage]);

  return (
    <div
      ref={containerRef}
      className={`
        ${activeMobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}
        flex-1 flex flex-col min-h-[500px] lg:min-h-0 lg:h-full bg-slate-100/50 border border-slate-200/60 rounded-2xl p-4 lg:p-6 print:border-none print:bg-transparent print:p-0 print:m-0 relative overflow-hidden
      `}
    >
      <div className="flex-1 min-h-0 overflow-auto flex justify-center w-full">
        <div
          id="surat-tanggungan-print-area"
          style={{
            width: pageW * currentScale,
            height: totalH * currentScale,
            flexShrink: 0,
            position: 'relative',
            margin: '0 auto',
          }}
          className="print:!w-auto print:!h-auto print:!m-0"
        >
          <div
            style={{
              transform: `scale(${currentScale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: ST_PAGE_GAP_PX,
            }}
          >
            <PageShell pageNumber={1} language="id" active={viewLanguage === 'id'} pageRef={page1Ref}>
              <SuratTanggunganIdTemplatePage data={formData} />
            </PageShell>
            <PageShell pageNumber={2} language="jp" active={viewLanguage === 'jp'} pageRef={page2Ref}>
              <PageJapanese data={formData} />
            </PageShell>
          </div>
        </div>
      </div>
    </div>
  );
};
