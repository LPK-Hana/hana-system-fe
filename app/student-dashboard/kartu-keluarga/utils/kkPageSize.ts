/** Indonesian KK — A4 landscape at 96 dpi */
export const KK_PAGE_ID_W_PX = 1122;
export const KK_PAGE_ID_H_PX = 794;
export const KK_PAGE_ID_W_MM = '297mm';
export const KK_PAGE_ID_H_MM = '210mm';

/** Japanese 戸籍謄本 — A3 landscape at 96 dpi (matches contoh-kk.pdf) */
export const KK_PAGE_JP_W_PX = 1587;
export const KK_PAGE_JP_H_PX = 1123;
export const KK_PAGE_JP_W_MM = '420mm';
export const KK_PAGE_JP_H_MM = '297mm';

export type KkPageVariant = 'id' | 'jp';

export function getKkPageSize(variant: KkPageVariant) {
  return variant === 'jp'
    ? { wPx: KK_PAGE_JP_W_PX, hPx: KK_PAGE_JP_H_PX, wMm: KK_PAGE_JP_W_MM, hMm: KK_PAGE_JP_H_MM }
    : { wPx: KK_PAGE_ID_W_PX, hPx: KK_PAGE_ID_H_PX, wMm: KK_PAGE_ID_W_MM, hMm: KK_PAGE_ID_H_MM };
}
