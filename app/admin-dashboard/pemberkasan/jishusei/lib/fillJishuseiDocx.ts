import PizZip from "pizzip";
import { ensureJishuseiMultiRowBookmarks } from "./ensureJishuseiBookmarks";

export type PendidikanRow = {
  mulaiThn?: string;
  mulaiBln?: string;
  selesaiThn?: string;
  selesaiBln?: string;
  namaSekolahJp?: string;
  namaSekolahId?: string;
};

export type KerjaRow = {
  dariThn?: string;
  dariBln?: string;
  sampaiThn?: string;
  sampaiBln?: string;
  sampaiSekarang?: boolean;
  namaPtJp?: string;
  namaPtId?: string;
  jenisKerjaJp?: string;
  jenisKerjaId?: string;
};

export type JishuseiFormData = {
  buatThn: string;
  buatBln: string;
  buatTgl: string;
  namaLengkap: string;
  namaKatakana: string;
  gender: "Laki-laki" | "Perempuan";
  lahirThn: string;
  lahirBln: string;
  lahirTgl: string;
  /** Dihitung otomatis dari tanggal lahir (bisa di-override) */
  umur: string;
  alamat: string;
  pendidikan: PendidikanRow[];
  kerja: KerjaRow[];
  shokushuJp?: string;
  shokushuId?: string;
  /** Angka bulan saja, mis. "10" → ditulis "10ヶ月" / "10 bulan" */
  totalBulanKerja?: string;
  namaPeserta?: string;
  namaPerusahaanJp?: string;
  namaPerusahaanId?: string;
  namaKumiaiJp?: string;
  namaKumiaiId?: string;
};

export const MAX_PENDIDIKAN = 4;
export const MAX_KERJA = 5;

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

/** Replace all w:t text inside a bookmark with a single value. */
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
  const startTag = m[0];

  const filled = `${startTag}<w:r>${rPrXml}<w:t xml:space="preserve">${esc(value)}</w:t></w:r>${endTag}`;
  return before + filled + after;
}

function setMany(xml: string, names: string[], value: string): string {
  let out = xml;
  for (const n of names) out = setBookmarkText(out, n, value);
  return out;
}

function applyGender(xml: string, gender: JishuseiFormData["gender"]): string {
  let seen = 0;
  return xml.replace(/<w:t[^>]*>☐<\/w:t>/g, (match) => {
    seen += 1;
    if (gender === "Laki-laki" && seen === 1) {
      return match.replace("☐", "■");
    }
    if (gender === "Perempuan" && seen === 2) {
      return match.replace("☐", "■");
    }
    return match;
  });
}

const BUAT_THN = Array.from({ length: 14 }, (_, i) => `thnBuat${i + 1}`);
const BUAT_BLN = Array.from({ length: 14 }, (_, i) => `blnBuat${i + 1}`);
const BUAT_TGL = Array.from({ length: 14 }, (_, i) => `tglBuat${i + 1}`);

function jpYm(thn?: string, bln?: string): string {
  if (!thn) return "";
  return `${thn}年${bln || ""}月`;
}

function idYm(thn?: string, bln?: string): string {
  if (!thn) return "";
  return `Thn.${thn} Bln.${bln || ""}`;
}

function fillPendidikan(xml: string, rows: PendidikanRow[]): string {
  let out = xml;
  for (let i = 0; i < MAX_PENDIDIKAN; i++) {
    const n = i + 1;
    const row = rows[i];
    const has = !!(row && (row.mulaiThn || row.namaSekolahJp || row.namaSekolahId));

    const hasenJp = n === 1 ? "hasen1" : `hasenSekolahJp${n}`;
    const hasenId = n === 1 ? "hasen2" : `hasenSekolahId${n}`;

    if (!has) {
      out = setBookmarkText(out, `tglMulaiSekolahJp${n}`, "");
      out = setBookmarkText(out, `tglKelarSekolahJp${n}`, "");
      out = setBookmarkText(out, `tglMulaiSekolahId${n}`, "");
      out = setBookmarkText(out, `tglKelarSekolahId${n}`, "");
      out = setBookmarkText(out, hasenJp, "");
      out = setBookmarkText(out, hasenId, "");
      out = setBookmarkText(out, `namaSekolahJp${n}`, "");
      out = setBookmarkText(out, `namaSekolahId${n}`, "");
      continue;
    }

    // Same format as row 1: 年/月 ～ 年/月 + Thn. Bln. ～ Thn. Bln.
    out = setBookmarkText(out, `tglMulaiSekolahJp${n}`, jpYm(row.mulaiThn, row.mulaiBln));
    out = setBookmarkText(out, `tglKelarSekolahJp${n}`, jpYm(row.selesaiThn, row.selesaiBln));
    out = setBookmarkText(out, `tglMulaiSekolahId${n}`, idYm(row.mulaiThn, row.mulaiBln));
    out = setBookmarkText(out, `tglKelarSekolahId${n}`, idYm(row.selesaiThn, row.selesaiBln));
    out = setBookmarkText(out, hasenJp, "～");
    out = setBookmarkText(out, hasenId, "～");
    out = setBookmarkText(out, `namaSekolahJp${n}`, row.namaSekolahJp || "");
    out = setBookmarkText(out, `namaSekolahId${n}`, row.namaSekolahId || "");
  }
  return out;
}

function fillKerja(xml: string, rows: KerjaRow[]): string {
  let out = xml;
  for (let i = 0; i < MAX_KERJA; i++) {
    const n = i + 1;
    const row = rows[i];
    const has = !!(
      row &&
      (row.dariThn || row.namaPtJp || row.namaPtId || row.jenisKerjaJp || row.jenisKerjaId)
    );

    const hasenJp = n === 1 ? "hasen5" : `hasenKerjaJp${n}`;
    const hasenId = n === 1 ? "hasen6" : `hasenKerjaId${n}`;
    const kakkoA = n === 1 ? "kakko1" : `kakkoKerja${n}a`;
    const kakkoB = n === 1 ? "kakko2" : `kakkoKerja${n}b`;
    const kakkoC = n === 1 ? "kakko3" : `kakkoKerja${n}c`;
    const kakkoD = n === 1 ? "kakko4" : `kakkoKerja${n}d`;

    if (!has) {
      out = setBookmarkText(out, `tglKerja${n}DariJp`, "");
      out = setBookmarkText(out, `tglKerja${n}SampaiJp`, "");
      out = setBookmarkText(out, `tglKerja${n}DariId`, "");
      out = setBookmarkText(out, `tglKerja${n}SampaiId`, "");
      out = setBookmarkText(out, hasenJp, "");
      out = setBookmarkText(out, hasenId, "");
      out = setBookmarkText(out, `namaPT${n}Jp`, "");
      out = setBookmarkText(out, `namaPT${n}Id`, "");
      out = setBookmarkText(out, `jenisKerja${n}Jp`, "");
      out = setBookmarkText(out, `jenisKerja${n}Id`, "");
      out = setBookmarkText(out, kakkoA, "");
      out = setBookmarkText(out, kakkoB, "");
      out = setBookmarkText(out, kakkoC, "");
      out = setBookmarkText(out, kakkoD, "");
      continue;
    }

    const sampaiJp = row.sampaiSekarang
      ? "現在まで"
      : jpYm(row.sampaiThn, row.sampaiBln);
    const sampaiId = row.sampaiSekarang
      ? "sekarang"
      : idYm(row.sampaiThn, row.sampaiBln);

    // Same format as row 1: dates + ～, company　(jenis) on JP then ID lines
    out = setBookmarkText(out, `tglKerja${n}DariJp`, jpYm(row.dariThn, row.dariBln));
    out = setBookmarkText(out, `tglKerja${n}SampaiJp`, sampaiJp);
    out = setBookmarkText(out, `tglKerja${n}DariId`, idYm(row.dariThn, row.dariBln));
    out = setBookmarkText(out, `tglKerja${n}SampaiId`, sampaiId);
    out = setBookmarkText(out, hasenJp, "～");
    out = setBookmarkText(out, hasenId, "～");
    out = setBookmarkText(out, `namaPT${n}Jp`, row.namaPtJp || "");
    out = setBookmarkText(out, `namaPT${n}Id`, row.namaPtId || "");
    out = setBookmarkText(out, `jenisKerja${n}Jp`, row.jenisKerjaJp || "");
    out = setBookmarkText(out, `jenisKerja${n}Id`, row.jenisKerjaId || "");
    out = setBookmarkText(out, kakkoA, row.jenisKerjaJp ? "(" : "");
    out = setBookmarkText(out, kakkoB, row.jenisKerjaJp ? ")" : "");
    out = setBookmarkText(out, kakkoC, row.jenisKerjaId ? "(" : "");
    out = setBookmarkText(out, kakkoD, row.jenisKerjaId ? ")" : "");
  }
  return out;
}

/** Hitung umur dari tanggal lahir vs tanggal acuan (default: hari ini). */
export function calcUmur(
  lahirThn: string,
  lahirBln: string,
  lahirTgl: string,
  refThn?: string,
  refBln?: string,
  refTgl?: string,
): string {
  const y = parseInt(lahirThn, 10);
  const m = parseInt(lahirBln, 10) || 1;
  const d = parseInt(lahirTgl, 10) || 1;
  if (!y || Number.isNaN(y)) return "";

  const now = new Date();
  const ry = parseInt(refThn || "", 10) || now.getFullYear();
  const rm = parseInt(refBln || "", 10) || now.getMonth() + 1;
  const rd = parseInt(refTgl || "", 10) || now.getDate();

  let age = ry - y;
  if (rm < m || (rm === m && rd < d)) age -= 1;
  if (age < 0 || age > 120) return "";
  return String(age);
}

export function fillJishuseiDocx(
  templateBytes: ArrayBuffer | Uint8Array | Buffer,
  data: JishuseiFormData,
): Uint8Array {
  const prepared = ensureJishuseiMultiRowBookmarks(templateBytes);
  const zip = new PizZip(prepared);
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("Invalid DOCX: missing word/document.xml");

  let xml = docFile.asText();

  xml = setMany(xml, BUAT_THN, data.buatThn);
  xml = setMany(xml, BUAT_BLN, data.buatBln);
  xml = setMany(xml, BUAT_TGL, data.buatTgl);

  xml = setBookmarkText(xml, "namaLengkap1", data.namaLengkap);
  xml = setBookmarkText(xml, "namaKatakana1", data.namaKatakana);

  xml = setBookmarkText(xml, "thnLahir1", data.lahirThn);
  xml = setBookmarkText(xml, "thnLahir2", data.lahirThn);
  xml = setBookmarkText(xml, "blnLahir1", data.lahirBln);
  xml = setBookmarkText(xml, "blnLahir2", data.lahirBln);
  xml = setBookmarkText(xml, "tglLahir1", data.lahirTgl);
  xml = setBookmarkText(xml, "tglLahir2", data.lahirTgl);

  const umur =
    data.umur ||
    calcUmur(
      data.lahirThn,
      data.lahirBln,
      data.lahirTgl,
      data.buatThn,
      data.buatBln,
      data.buatTgl,
    );
  xml = setBookmarkText(xml, "umurJp1", umur);
  xml = setBookmarkText(xml, "umurId1", umur);

  xml = setBookmarkText(xml, "alamat1", data.alamat);

  xml = fillPendidikan(xml, data.pendidikan || []);
  xml = fillKerja(xml, data.kerja || []);

  if (data.shokushuJp) {
    xml = setBookmarkText(xml, "shokushuJp1", data.shokushuJp);
    xml = setBookmarkText(xml, "shokushuJp2", data.shokushuJp);
  }
  if (data.shokushuId) {
    xml = setBookmarkText(xml, "shokushuId1", data.shokushuId);
    xml = setBookmarkText(xml, "shokushuId2", data.shokushuId);
  }

  const bulan = String(data.totalBulanKerja || "").replace(/[^\d]/g, "");
  if (bulan) {
    xml = setBookmarkText(xml, "totalTahunKerjaJp", `${bulan}ヶ月`);
    xml = setBookmarkText(xml, "totalTahunKerjaId", `${bulan} bulan`);
  }

  const peserta = data.namaPeserta || data.namaLengkap;
  xml = setBookmarkText(xml, "namaPeserta1", peserta);
  xml = setBookmarkText(xml, "namaPeserta2", peserta);
  xml = setBookmarkText(xml, "namaPeserta3", peserta);

  if (data.namaPerusahaanJp) {
    xml = setBookmarkText(xml, "namaPerusahaanJp1", data.namaPerusahaanJp);
  }
  if (data.namaPerusahaanId) {
    xml = setBookmarkText(xml, "namaPerusahaanId1", data.namaPerusahaanId);
  }
  if (data.namaKumiaiJp) {
    xml = setBookmarkText(xml, "namaKumiaiJp1", data.namaKumiaiJp);
    xml = setBookmarkText(xml, "namaKumiaiJp", data.namaKumiaiJp);
  }
  if (data.namaKumiaiId) {
    xml = setBookmarkText(xml, "namaKumiaiId1", data.namaKumiaiId);
    xml = setBookmarkText(xml, "namaKumiaiId", data.namaKumiaiId);
  }

  xml = applyGender(xml, data.gender);

  zip.file("word/document.xml", xml);
  return zip.generate({ type: "uint8array" });
}
