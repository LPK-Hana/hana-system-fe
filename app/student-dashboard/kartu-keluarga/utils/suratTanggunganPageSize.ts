/** Kalibrasi layout Surat Tanggungan — A4 21×29,7 cm, zoom Word 107% */

export const ST_CONTENT_SCALE = 1.07;

/** A4 @ 96 dpi */
export const ST_PAGE_W_PX = 794;
export const ST_PAGE_H_PX = 1123;
export const ST_PAGE_W_MM = '210mm';
export const ST_PAGE_H_MM = '297mm';
export const ST_PAGE_COUNT = 2;
export const ST_PAGE_GAP_PX = 24;

/** Area konten sebelum transform 107% (agar muat di A4) */
export const ST_INNER_W_PX = ST_PAGE_W_PX / ST_CONTENT_SCALE;
export const ST_INNER_H_PX = ST_PAGE_H_PX / ST_CONTENT_SCALE;

export const ST_FONT_BODY_PT = 10.5;
export const ST_FONT_TITLE_PT = 18;
export const ST_FONT_FURIGANA_PT = 7;

/** Margin halaman (mm) — disesuaikan template Word/kosongan */
export const ST_MARGIN_ID = { top: 19, right: 20, bottom: 16, left: 24 } as const;
export const ST_MARGIN_JP = { top: 17, right: 17, bottom: 14, left: 19 } as const;

/** Lebar label kolom info (px pada kanvas inner, font 10.5pt) */
export const ST_ID_LABEL_W = 70;
export const ST_ID_LABEL_W_RIGHT = 96;
export const ST_JP_LABEL_W = 100;
export const ST_JP_LABEL_W_SHORT = 44;

export function getSuratTanggunganPageSize() {
  return {
    wPx: ST_PAGE_W_PX,
    hPx: ST_PAGE_H_PX,
    wMm: ST_PAGE_W_MM,
    hMm: ST_PAGE_H_MM,
    pageCount: ST_PAGE_COUNT,
    gapPx: ST_PAGE_GAP_PX,
    contentScale: ST_CONTENT_SCALE,
    innerWPx: ST_INNER_W_PX,
    innerHPx: ST_INNER_H_PX,
  };
}

export function getSuratTanggunganTotalHeightPx() {
  return ST_PAGE_H_PX * ST_PAGE_COUNT + ST_PAGE_GAP_PX * (ST_PAGE_COUNT - 1);
}

export function stMarginPadding(m: { top: number; right: number; bottom: number; left: number }) {
  return `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`;
}
