import PizZip from "pizzip";

export const MAX_PESERTA = 10;
const ROSTER_OCCS = [1, 2, 3, 4] as const;

/**
 * Template hanya punya bookmark peserta #1. Baris 2–10 di tabel roster
 * (occ 1–4) dan daftar masuk Jepang (occ 5) diisi bookmark namaPesertaN_*
 * agar form bisa multi-orang. Idempotent jika namaPeserta2_1 sudah ada.
 */
export function ensureImigrasiPerusahaanBookmarks(
  templateBytes: ArrayBuffer | Uint8Array | Buffer,
): Uint8Array {
  const zip = new PizZip(templateBytes);
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("Invalid DOCX: missing word/document.xml");

  let xml = docFile.asText();
  if (xml.includes('w:name="namaPeserta2_1"')) {
    xml = xml.replace(/<w:lastRenderedPageBreak\/>/g, "");
    zip.file("word/document.xml", xml);
    return zip.generate({ type: "uint8array" });
  }

  let nextId = maxBookmarkId(xml) + 1;

  for (const occ of ROSTER_OCCS) {
    const patched = patchRosterTable(xml, occ, nextId);
    xml = patched.xml;
    nextId = patched.nextId;
  }

  const listPatched = patchListTable(xml, nextId);
  xml = listPatched.xml;

  xml = xml.replace(/<w:lastRenderedPageBreak\/>/g, "");
  zip.file("word/document.xml", xml);
  return zip.generate({ type: "uint8array" });
}

function maxBookmarkId(xml: string): number {
  let max = 200;
  for (const m of xml.matchAll(/w:id="(\d+)"/g)) {
    const n = parseInt(m[1], 10);
    if (n > max) max = n;
  }
  return max;
}

/** Last `<w:tbl` before idx — jangan kena `<w:tblPr` / `<w:tblGrid`. */
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

function getRows(tblXml: string) {
  const rows: { start: number; end: number; xml: string }[] = [];
  const re = /<w:tr[\s>]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tblXml))) {
    const s = m.index;
    const e = tblXml.indexOf("</w:tr>", s);
    if (e < 0) break;
    rows.push({ start: s, end: e + 7, xml: tblXml.slice(s, e + 7) });
    re.lastIndex = e + 7;
  }
  return rows;
}

function remapBookmarkIds(rowXml: string, startId: number): {
  xml: string;
  nextId: number;
} {
  let id = startId;
  const map = new Map<string, number>();
  let out = rowXml.replace(
    /<w:bookmarkStart([^>]*?)w:id="(\d+)"([^>]*?)\/>/g,
    (_full, pre, oldId, post) => {
      const neu = id++;
      map.set(oldId, neu);
      return `<w:bookmarkStart${pre}w:id="${neu}"${post}/>`;
    },
  );
  out = out.replace(
    /<w:bookmarkEnd w:id="(\d+)"\/>/g,
    (_full, oldId) => {
      const neu = map.get(oldId);
      if (neu == null) return _full;
      return `<w:bookmarkEnd w:id="${neu}"/>`;
    },
  );
  return { xml: out, nextId: id };
}

/** Clone row peserta#1 → peserta#N untuk tabel roster (氏名/生年月日/性別). */
function cloneRosterRow(
  templateRow: string,
  pesertaNo: number,
  occ: number,
  startId: number,
): { xml: string; nextId: number } {
  let row = templateRow;
  row = row.replace(/Peserta1_/g, `Peserta${pesertaNo}_`);
  // Nomor urut di sel pertama
  row = row.replace(/<w:t>1<\/w:t>/, `<w:t>${pesertaNo}</w:t>`);
  // Pastikan nama bookmark occ tetap benar (sudah dari template)
  void occ;
  return remapBookmarkIds(row, startId);
}

function patchRosterTable(
  xml: string,
  occ: number,
  startId: number,
): { xml: string; nextId: number } {
  const anchor = `w:name="namaPeserta1_${occ}"`;
  const idx = xml.indexOf(anchor);
  if (idx < 0) return { xml, nextId: startId };

  const tblStart = findLastOpenTag(xml, "w:tbl", idx);
  const tblEnd = xml.indexOf("</w:tbl>", idx);
  if (tblStart < 0 || tblEnd < 0) return { xml, nextId: startId };

  const tblXml = xml.slice(tblStart, tblEnd + "</w:tbl>".length);
  const rows = getRows(tblXml);
  // header + 10 data rows expected
  if (rows.length < 11) return { xml, nextId: startId };

  const templateRow = rows[1].xml;
  let nextId = startId;
  const newRows = rows.map((r, i) => {
    if (i === 0 || i === 1) return r.xml; // header + peserta 1
    const pesertaNo = i; // row index 2 → peserta 2
    if (pesertaNo > MAX_PESERTA) return r.xml;
    if (r.xml.includes(`w:name="namaPeserta${pesertaNo}_${occ}"`)) return r.xml;
    const cloned = cloneRosterRow(templateRow, pesertaNo, occ, nextId);
    nextId = cloned.nextId;
    return cloned.xml;
  });

  let rebuilt = tblXml;
  // Replace from end so offsets stay valid
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    rebuilt = rebuilt.slice(0, r.start) + newRows[i] + rebuilt.slice(r.end);
  }

  return {
    xml: xml.slice(0, tblStart) + rebuilt + xml.slice(tblEnd + "</w:tbl>".length),
    nextId,
  };
}

/** Tabel daftar masuk Jepang: namaPesertaN_5 + tglBerangkatN (baris 1–10). */
function cloneListRow(
  templateRow: string,
  pesertaNo: number,
  startId: number,
): { xml: string; nextId: number } {
  let row = templateRow;
  row = row.replace(/namaPeserta1_5/g, `namaPeserta${pesertaNo}_5`);
  row = row.replace(/tglBerangkat1/g, `tglBerangkat${pesertaNo}`);
  row = row.replace(/<w:t>1<\/w:t>/, `<w:t>${pesertaNo}</w:t>`);
  return remapBookmarkIds(row, startId);
}

function patchListTable(
  xml: string,
  startId: number,
): { xml: string; nextId: number } {
  const anchor = 'w:name="namaPeserta1_5"';
  const idx = xml.indexOf(anchor);
  if (idx < 0) return { xml, nextId: startId };

  const tblStart = findLastOpenTag(xml, "w:tbl", idx);
  const tblEnd = xml.indexOf("</w:tbl>", idx);
  if (tblStart < 0 || tblEnd < 0) return { xml, nextId: startId };

  const tblXml = xml.slice(tblStart, tblEnd + "</w:tbl>".length);
  const rows = getRows(tblXml);
  if (rows.length < 11) return { xml, nextId: startId };

  const templateRow = rows[1].xml;
  let nextId = startId;
  const newRows = rows.map((r, i) => {
    if (i === 0 || i === 1) return r.xml;
    const pesertaNo = i;
    if (pesertaNo > MAX_PESERTA) return r.xml;
    if (r.xml.includes(`w:name="namaPeserta${pesertaNo}_5"`)) return r.xml;
    const cloned = cloneListRow(templateRow, pesertaNo, nextId);
    nextId = cloned.nextId;
    return cloned.xml;
  });

  let rebuilt = tblXml;
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    rebuilt = rebuilt.slice(0, r.start) + newRows[i] + rebuilt.slice(r.end);
  }

  return {
    xml: xml.slice(0, tblStart) + rebuilt + xml.slice(tblEnd + "</w:tbl>".length),
    nextId,
  };
}
