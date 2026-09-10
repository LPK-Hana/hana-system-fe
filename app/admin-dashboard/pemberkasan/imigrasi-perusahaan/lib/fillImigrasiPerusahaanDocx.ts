import PizZip from "pizzip";
import {
  ensureImigrasiPerusahaanBookmarks,
  MAX_PESERTA,
} from "./ensureImigrasiPerusahaanBookmarks";

export { MAX_PESERTA };

export type PesertaRow = {
  nama: string;
  lahirThn: string;
  lahirBln: string;
  lahirTgl: string;
  gender: "Laki-laki" | "Perempuan";
};

export type ImigrasiPerusahaanFormData = {
  buatThn: string;
  buatBln: string;
  buatTgl: string;
  namaPerusahaanJp: string;
  namaPerusahaanId: string;
  namaKumiaiJp: string;
  namaKumiaiId: string;
  /** Daftar peserta (maks. 10). */
  peserta: PesertaRow[];
  /** Tanggal keberangkatan / masuk Jepang → 2026年7月15日 */
  tglBrgktThn: string;
  tglBrgktBln: string;
  tglBrgktTgl: string;
  shokushuJp: string;
  namaPTPendamping: string;
  namaDirekturPT: string;
  namaRijicho: string;
  /** Tanggal masuk & keluar diklat */
  tglMskDiklatThn: string;
  tglMskDiklatBln: string;
  tglMskDiklatTgl: string;
  tglKlrDiklatThn: string;
  tglKlrDiklatBln: string;
  tglKlrDiklatTgl: string;
};

const XML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function esc(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => XML_ESCAPE[c] || c);
}

/** Last `<w:p` / `<w:tr` before idx — jangan kena `<w:pPr` / `<w:trPr`. */
function findLastOpenTag(xml: string, tag: string, beforeIdx: number): number {
  const re = new RegExp(`<${tag}(?=[\\s>])`, "g");
  let last = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    if (m.index >= beforeIdx) break;
    last = m.index;
  }
  return last;
}

function setBookmarkText(xml: string, bookmarkName: string, value: string): string {
  const startRe = new RegExp(
    `<w:bookmarkStart([^>]*w:name="${bookmarkName}"[^>]*)/>`,
  );
  const m = xml.match(startRe);
  if (!m || m.index == null) return xml;

  const id = (m[1].match(/w:id="(\d+)"/) || [])[1];
  if (!id) return xml;

  const startIdx = m.index;
  const endTag = `<w:bookmarkEnd w:id="${id}"/>`;
  const endIdx = xml.indexOf(endTag, startIdx);
  if (endIdx < 0) return xml;

  const before = xml.slice(0, startIdx);
  const after = xml.slice(endIdx + endTag.length);
  const block = xml.slice(startIdx, endIdx + endTag.length);
  const rPr = (block.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [null])[0];
  const rPrXml = rPr ? rPr : "";
  const filled = `${m[0]}<w:r>${rPrXml}<w:t xml:space="preserve">${esc(value)}</w:t></w:r>${endTag}`;
  return before + filled + after;
}

function setMany(xml: string, names: string[], value: string): string {
  let out = xml;
  for (const n of names) out = setBookmarkText(out, n, value);
  return out;
}

function getBookmarkMeta(
  xml: string,
  bookmarkName: string,
): { startTag: string; id: string; index: number } | null {
  const startRe = new RegExp(
    `<w:bookmarkStart([^>]*w:name="${bookmarkName}"[^>]*)/>`,
  );
  const m = xml.match(startRe);
  if (!m || m.index == null) return null;
  const id = (m[1].match(/w:id="(\d+)"/) || [])[1];
  if (!id) return null;
  return { startTag: m[0], id, index: m.index };
}

function emptyCenteredP(): string {
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p>`;
}

function bmRun(
  startTag: string,
  id: string,
  value: string,
  rPrXml = "",
): string {
  if (!value) {
    return `${startTag}<w:bookmarkEnd w:id="${id}"/>`;
  }
  return `${startTag}<w:r>${rPrXml}<w:t xml:space="preserve">${esc(value)}</w:t></w:r><w:bookmarkEnd w:id="${id}"/>`;
}

/**
 * Gender cell: hanya 男 atau 女 (tanpa ・).
 * Empty → kosong total.
 */
function finalizeGenderCell(
  xml: string,
  n: number,
  occ: number,
  genderChar: "男" | "女" | "",
): string {
  const lkName = `genderLkPeserta${n}_${occ}`;
  const prName = `genderPrPeserta${n}_${occ}`;
  const lk = getBookmarkMeta(xml, lkName);
  const pr = getBookmarkMeta(xml, prName);
  if (!lk || !pr) return xml;

  const pStart = findLastOpenTag(xml, "w:p", lk.index);
  const pEnd = xml.indexOf("</w:p>", Math.max(lk.index, pr.index));
  if (pStart < 0 || pEnd < 0) return xml;

  const pXml = xml.slice(pStart, pEnd + 6);
  const pPrMatch = pXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const pPr = pPrMatch ? pPrMatch[0] : `<w:pPr><w:jc w:val="center"/></w:pPr>`;
  const rPr =
    (pXml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [null])[0] ||
    `<w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr>`;

  const lkOnly = genderChar === "男" ? "男" : "";
  const prOnly = genderChar === "女" ? "女" : "";
  const body =
    bmRun(lk.startTag, lk.id, lkOnly, rPr) +
    bmRun(pr.startTag, pr.id, prOnly, rPr);

  // Preserve opening <w:p ...> attrs
  const openEnd = pXml.indexOf(">");
  const open = pXml.slice(0, openEnd + 1);
  const next = `${open}${pPr}${body}</w:p>`;
  return xml.slice(0, pStart) + next + xml.slice(pEnd + 6);
}

function getRowTcs(rowXml: string) {
  const tcs: { start: number; end: number; xml: string }[] = [];
  const re = /<w:tc[\s>]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rowXml))) {
    const s = m.index;
    const e = rowXml.indexOf("</w:tc>", s);
    if (e < 0) break;
    tcs.push({ start: s, end: e + 7, xml: rowXml.slice(s, e + 7) });
    re.lastIndex = e + 7;
  }
  return tcs;
}

function replaceCellBody(tcXml: string, bodyXml: string): string {
  const prEnd = tcXml.indexOf("</w:tcPr>");
  if (prEnd < 0) {
    return tcXml.replace(/<\/w:tc>/, `${bodyXml}</w:tc>`);
  }
  return `${tcXml.slice(0, prEnd + "</w:tcPr>".length)}${bodyXml}</w:tc>`;
}

/**
 * Baris tanpa peserta: kosongkan kewarganegaraan / lahir / gender
 * (bukan cuma bookmark, biar tidak sisa インドネシア / 年月日 / ・).
 * Sel nomor (順) dibiarkan.
 */
function clearUnusedRosterRow(xml: string, n: number, occ: number): string {
  const meta = getBookmarkMeta(xml, `namaPeserta${n}_${occ}`);
  if (!meta) return xml;

  const trStart = findLastOpenTag(xml, "w:tr", meta.index);
  const trEnd = xml.indexOf("</w:tr>", meta.index);
  if (trStart < 0 || trEnd < 0) return xml;

  const rowXml = xml.slice(trStart, trEnd + 7);
  const tcs = getRowTcs(rowXml);
  // [0]=順 [1]=氏名 [2]=国籍 [3]=生年月日 [4]=性別
  if (tcs.length < 5) return xml;

  let nextRow = rowXml;
  // Clear from end so offsets stay valid
  for (const cellIdx of [4, 3, 2]) {
    const tc = getRowTcs(nextRow)[cellIdx];
    if (!tc) continue;
    const cleared = replaceCellBody(tc.xml, emptyCenteredP());
    nextRow = nextRow.slice(0, tc.start) + cleared + nextRow.slice(tc.end);
  }

  // Nama sudah di-set bookmark kosong; pastikan sel nama juga bersih dari sisa placeholder
  const namaTc = getRowTcs(nextRow)[1];
  if (namaTc) {
    const lk = getBookmarkMeta(nextRow, `namaPeserta${n}_${occ}`);
    const namaBody = lk
      ? `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${lk.startTag}<w:bookmarkEnd w:id="${lk.id}"/></w:p>`
      : emptyCenteredP();
    const clearedNama = replaceCellBody(namaTc.xml, namaBody);
    nextRow =
      nextRow.slice(0, namaTc.start) + clearedNama + nextRow.slice(namaTc.end);
  }

  return xml.slice(0, trStart) + nextRow + xml.slice(trEnd + 7);
}

/** DOB terisi: satu teks `YYYY年M月D日` di bookmark thn (hapus sisa 年月日 terpisah). */
function finalizeDobCell(
  xml: string,
  n: number,
  occ: number,
  thn: string,
  bln: string,
  tgl: string,
): string {
  const thnMeta = getBookmarkMeta(xml, `thnLahirPeserta${n}_${occ}`);
  const blnMeta = getBookmarkMeta(xml, `blnLahirPeserta${n}_${occ}`);
  const tglMeta = getBookmarkMeta(xml, `tglLahirPeserta${n}_${occ}`);
  if (!thnMeta || !blnMeta || !tglMeta) return xml;

  const pStart = findLastOpenTag(xml, "w:p", thnMeta.index);
  const pEnd = xml.indexOf("</w:p>", tglMeta.index);
  if (pStart < 0 || pEnd < 0) return xml;

  const pXml = xml.slice(pStart, pEnd + 6);
  const pPrMatch = pXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const pPr = pPrMatch ? pPrMatch[0] : `<w:pPr><w:jc w:val="center"/></w:pPr>`;
  const rPr =
    (pXml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [null])[0] ||
    `<w:rPr><w:rFonts w:hint="eastAsia"/></w:rPr>`;

  const full = thn ? `${thn}年${bln || ""}月${tgl || ""}日` : "";
  const body =
    bmRun(thnMeta.startTag, thnMeta.id, full, rPr) +
    bmRun(blnMeta.startTag, blnMeta.id, "", rPr) +
    bmRun(tglMeta.startTag, tglMeta.id, "", rPr);

  const openEnd = pXml.indexOf(">");
  const open = pXml.slice(0, openEnd + 1);
  return xml.slice(0, pStart) + `${open}${pPr}${body}</w:p>` + xml.slice(pEnd + 6);
}

export function jpYmd(thn?: string, bln?: string, tgl?: string): string {
  if (!thn) return "";
  return `${thn}年${bln || ""}月${tgl || ""}日`;
}

/** Tambah N hari ke tanggal Y/M/D → string JP. */
export function jpYmdPlusDays(
  thn: string,
  bln: string,
  tgl: string,
  plusDays: number,
): string {
  const y = parseInt(thn, 10);
  const m = parseInt(bln, 10);
  const d = parseInt(tgl, 10);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + plusDays);
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`;
}

export function emptyPeserta(): PesertaRow {
  return {
    nama: "",
    lahirThn: "",
    lahirBln: "",
    lahirTgl: "",
    gender: "Laki-laki",
  };
}

/** Normalisasi: terima `peserta[]` atau field lama single-peserta. */
export function normalizePesertaList(
  data: ImigrasiPerusahaanFormData & {
    namaPeserta?: string;
    lahirThn?: string;
    lahirBln?: string;
    lahirTgl?: string;
    gender?: "Laki-laki" | "Perempuan";
  },
): PesertaRow[] {
  if (Array.isArray(data.peserta) && data.peserta.length > 0) {
    return data.peserta.slice(0, MAX_PESERTA).map((p) => ({
      nama: p?.nama ?? "",
      lahirThn: p?.lahirThn ?? "",
      lahirBln: p?.lahirBln ?? "",
      lahirTgl: p?.lahirTgl ?? "",
      gender: p?.gender === "Perempuan" ? "Perempuan" : "Laki-laki",
    }));
  }
  if (data.namaPeserta) {
    return [
      {
        nama: data.namaPeserta,
        lahirThn: data.lahirThn || "",
        lahirBln: data.lahirBln || "",
        lahirTgl: data.lahirTgl || "",
        gender: data.gender === "Perempuan" ? "Perempuan" : "Laki-laki",
      },
    ];
  }
  return [emptyPeserta()];
}

const BUAT_THN = Array.from({ length: 8 }, (_, i) => `thnBuat${i + 1}`);
const BUAT_BLN = Array.from({ length: 8 }, (_, i) => `blnBuat${i + 1}`);
const BUAT_TGL = Array.from({ length: 8 }, (_, i) => `tglBuat${i + 1}`);
const ROSTER_OCCS = [1, 2, 3, 4] as const;

export function fillImigrasiPerusahaanDocx(
  templateBytes: ArrayBuffer | Uint8Array | Buffer,
  data: ImigrasiPerusahaanFormData,
): Uint8Array {
  const prepared = ensureImigrasiPerusahaanBookmarks(templateBytes);
  const zip = new PizZip(prepared);
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("Invalid DOCX: missing word/document.xml");

  let xml = docFile.asText();
  const peserta = normalizePesertaList(data);

  xml = setMany(xml, BUAT_THN, data.buatThn);
  xml = setMany(xml, BUAT_BLN, data.buatBln);
  xml = setMany(xml, BUAT_TGL, data.buatTgl);

  xml = setMany(
    xml,
    [
      "namaPerusahaanJp1",
      "namaPerusahaanJp2",
      "namaPerusahaanJp3",
      "namaPerusahaanJp4",
      "namaPerusahaanJp5",
    ],
    data.namaPerusahaanJp,
  );
  xml = setBookmarkText(xml, "namaPerusahaanId1", data.namaPerusahaanId);

  xml = setMany(
    xml,
    [
      "namaKumiaiJp1",
      "namaKumiaiJp2",
      "namaKumiaiJp3",
      "namaKumiaiJp4",
      "namaKumiaiJp5",
      "namaKumiaiJp6",
      "namaKumiaiJp7",
    ],
    data.namaKumiaiJp,
  );
  xml = setBookmarkText(xml, "namaKumiaiId1", data.namaKumiaiId);

  const tglBrgkt = jpYmd(data.tglBrgktThn, data.tglBrgktBln, data.tglBrgktTgl);
  xml = setBookmarkText(xml, "tglBrgkt1", tglBrgkt);

  for (let i = 0; i < MAX_PESERTA; i++) {
    const n = i + 1;
    const p = peserta[i];
    const nama = p?.nama?.trim() || "";
    const has = Boolean(nama);

    for (const occ of ROSTER_OCCS) {
      if (has) {
        xml = setBookmarkText(xml, `namaPeserta${n}_${occ}`, nama);
        xml = finalizeDobCell(
          xml,
          n,
          occ,
          p!.lahirThn,
          p!.lahirBln,
          p!.lahirTgl,
        );
        xml = finalizeGenderCell(
          xml,
          n,
          occ,
          p!.gender === "Laki-laki" ? "男" : "女",
        );
      } else {
        xml = clearUnusedRosterRow(xml, n, occ);
      }
    }

    xml = setBookmarkText(xml, `namaPeserta${n}_5`, nama);
    xml = setBookmarkText(xml, `tglBerangkat${n}`, has ? tglBrgkt : "");
  }

  xml = setBookmarkText(xml, "shokushuJp1", data.shokushuJp);
  xml = setBookmarkText(xml, "shokushuJp2", data.shokushuJp);

  xml = setMany(
    xml,
    ["namaPTPendamping1", "namaPTPendamping2", "namaPTPendamping3"],
    data.namaPTPendamping,
  );
  xml = setBookmarkText(xml, "namaDirekturPT1", data.namaDirekturPT);
  xml = setBookmarkText(xml, "namaRijicho1", data.namaRijicho);
  xml = setBookmarkText(xml, "namaRijicho2", data.namaRijicho);

  const tglMsk = jpYmd(
    data.tglMskDiklatThn,
    data.tglMskDiklatBln,
    data.tglMskDiklatTgl,
  );
  const tglKlr = jpYmd(
    data.tglKlrDiklatThn,
    data.tglKlrDiklatBln,
    data.tglKlrDiklatTgl,
  );
  xml = setMany(xml, ["tglMskDiklat1", "tglMskDiklat2", "tglMskDiklat3"], tglMsk);
  xml = setMany(xml, ["tglKlrDiklat1", "tglKlrDiklat2"], tglKlr);

  for (let n = 1; n <= 31; n++) {
    xml = setBookmarkText(
      xml,
      `tglMskDiklat_plus${n}`,
      jpYmdPlusDays(
        data.tglMskDiklatThn,
        data.tglMskDiklatBln,
        data.tglMskDiklatTgl,
        n,
      ),
    );
  }

  xml = xml.replace(/<w:lastRenderedPageBreak\/>/g, "");

  zip.file("word/document.xml", xml);
  return zip.generate({ type: "uint8array" });
}
