import PizZip from "pizzip";

/**
 * Ensure pendidikan rows 2–4 and kerja rows 2–5 mirror row-1 layout:
 *   period: JP line + ID line, with " ～ " between dates
 *   school: JP name line + ID name line
 *   company: "nama　(jenis)" JP line + ID line
 *
 * Idempotent when correct structure already present (hasenSekolahJp2).
 * Overwrites older incomplete multi-row bookmark injections.
 */
export function ensureJishuseiMultiRowBookmarks(
  templateBytes: ArrayBuffer | Uint8Array | Buffer,
): Uint8Array {
  const zip = new PizZip(templateBytes);
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("Invalid DOCX: missing word/document.xml");

  let xml = docFile.asText();
  const alreadyPatched =
    xml.includes('w:name="hasenSekolahJp2"') && xml.includes('w:name="kakkoKerja2a"');

  if (!alreadyPatched) {
    xml = patchEmptyRows(xml);
  }

  // Garis tanda tangan: hapus underline di pPr (biar tidak numpuk dengan underline spasi)
  xml = fixSignatureUnderlineOverlap(xml);

  // Spacer kosong sebelum page-break bikin halaman blank saat konten pendidikan/kerja penuh
  xml = removeEmptyParagraphsBeforePageBreaks(xml);

  // Hapus lastRenderedPageBreak (bekas layout Word lama) biar reflow/PDF tidak “nyangkut”
  xml = xml.replace(/<w:lastRenderedPageBreak\/>/g, "");

  zip.file("word/document.xml", xml);
  return zip.generate({ type: "uint8array" });
}

/**
 * Template punya w:u di pPr + w:u di run spasi → PDF/Word tampil seperti garis tebal/timpaan.
 * Sisakan underline hanya di run spasi garis tanda tangan.
 */
function fixSignatureUnderlineOverlap(xml: string): string {
  return xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (p) => {
    if (!p.includes("技能実習生の署名") && !p.includes("技能実習生の署")) return p;
    // Strip underline from paragraph-level rPr only
    return p.replace(/<w:pPr>[\s\S]*?<\/w:pPr>/, (pPr) =>
      pPr.replace(/<w:u\b[^/]*\/>/g, ""),
    );
  });
}

function isEffectivelyEmptyParagraph(p: string): boolean {
  if (/w:type="page"/.test(p)) return false;
  if (/<w:tbl[\s>]/.test(p)) return false;
  const texts = [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
  const joined = texts.join("").replace(/[\s\u3000\u00a0]/g, "");
  return joined.length === 0;
}

/**
 * Hapus paragraf kosong beruntun tepat sebelum <w:br w:type="page"/>.
 * Spacer ini OK di template kosong, tapi saat baris pendidikan/kerja terisi penuh
 * justru mendorong page-break ke halaman baru yang tampak kosong.
 */
function removeEmptyParagraphsBeforePageBreaks(xml: string): string {
  const pageBrRe = /<w:br\b[^>]*w:type="page"[^/]*\/>/g;
  const hits: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = pageBrRe.exec(xml))) hits.push(m.index);

  // Process from end so indices stay valid
  let out = xml;
  for (let h = hits.length - 1; h >= 0; h--) {
    const brIdx = hits[h];
    const pageParaStart = out.lastIndexOf("<w:p", brIdx);
    if (pageParaStart < 0) continue;

    // Walk backward over empty paragraphs
    let cutFrom = pageParaStart;
    let searchEnd = pageParaStart;
    for (;;) {
      const prevClose = out.lastIndexOf("</w:p>", searchEnd - 1);
      if (prevClose < 0) break;
      const prevStart = out.lastIndexOf("<w:p", prevClose);
      if (prevStart < 0 || prevStart >= searchEnd) break;
      const prevPara = out.slice(prevStart, prevClose + 6);
      if (!isEffectivelyEmptyParagraph(prevPara)) break;
      cutFrom = prevStart;
      searchEnd = prevStart;
    }

    if (cutFrom < pageParaStart) {
      out = out.slice(0, cutFrom) + out.slice(pageParaStart);
    }
  }
  return out;
}

function bm(id: number, name: string, inner: string, narrow = false): string {
  const fonts = narrow
    ? `<w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>`
    : "";
  return (
    `<w:bookmarkStart w:id="${id}" w:name="${name}"/>` +
    `<w:r><w:rPr>${fonts}<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>` +
    `<w:t xml:space="preserve">${inner}</w:t></w:r>` +
    `<w:bookmarkEnd w:id="${id}"/>`
  );
}

function runT(text: string, narrow = false): string {
  const fonts = narrow
    ? `<w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>`
    : "";
  return `<w:r><w:rPr>${fonts}<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>`;
}

function pCenter(inner: string): string {
  return (
    `<w:p>` +
    `<w:pPr><w:jc w:val="center"/><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr>` +
    `${inner}</w:p>`
  );
}

/** Nama sekolah / perusahaan: center seperti baris 1 template. */
function pName(inner: string): string {
  return (
    `<w:p>` +
    `<w:pPr><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr>` +
    `${inner}</w:p>`
  );
}

/** Keep <w:tcPr>, replace all body paragraphs. */
function replaceCellBody(tcXml: string, bodyXml: string): string {
  const prEnd = tcXml.indexOf("</w:tcPr>");
  if (prEnd < 0) {
    return tcXml.replace(/<\/w:tc>/, `${bodyXml}</w:tc>`);
  }
  const head = tcXml.slice(0, prEnd + "</w:tcPr>".length);
  return `${head}${bodyXml}</w:tc>`;
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

function eduPeriodBody(n: number, idBase: number) {
  let id = idBase;
  // Line JP: mulai ～ kelar
  const jp =
    bm(id++, `tglMulaiSekolahJp${n}`, "") +
    runT(" ") +
    bm(id++, `hasenSekolahJp${n}`, "") +
    runT(" ") +
    bm(id++, `tglKelarSekolahJp${n}`, "");
  // Line ID: mulai ～ kelar
  const idLine =
    bm(id++, `tglMulaiSekolahId${n}`, "") +
    runT(" ") +
    bm(id++, `hasenSekolahId${n}`, "") +
    runT(" ") +
    bm(id++, `tglKelarSekolahId${n}`, "");
  return { xml: pCenter(jp) + pCenter(idLine), nextId: id };
}

function eduNameBody(n: number, idBase: number) {
  let id = idBase;
  const jp = bm(id++, `namaSekolahJp${n}`, "", true);
  const idName = bm(id++, `namaSekolahId${n}`, "", true);
  return { xml: pName(jp) + pName(idName), nextId: id };
}

function kerjaPeriodBody(n: number, idBase: number) {
  let id = idBase;
  const jp =
    bm(id++, `tglKerja${n}DariJp`, "") +
    runT(" ") +
    bm(id++, `hasenKerjaJp${n}`, "") +
    runT(" ") +
    bm(id++, `tglKerja${n}SampaiJp`, "");
  const idLine =
    bm(id++, `tglKerja${n}DariId`, "") +
    runT(" ") +
    bm(id++, `hasenKerjaId${n}`, "") +
    runT(" ") +
    bm(id++, `tglKerja${n}SampaiId`, "");
  return { xml: pCenter(jp) + pCenter(idLine), nextId: id };
}

function kerjaNameBody(n: number, idBase: number) {
  let id = idBase;
  // Match row-1 pPr: center + spacing (visual sama dengan baris pertama)
  const pKerja = (inner: string) =>
    `<w:p>` +
    `<w:pPr>` +
    `<w:spacing w:line="260" w:lineRule="exact"/>` +
    `<w:jc w:val="center"/>` +
    `<w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>` +
    `</w:pPr>${inner}</w:p>`;

  const jp =
    bm(id++, `namaPT${n}Jp`, "", true) +
    runT("　", true) +
    bm(id++, `kakkoKerja${n}a`, "(", true) +
    bm(id++, `jenisKerja${n}Jp`, "", true) +
    bm(id++, `kakkoKerja${n}b`, ")", true);
  const idLine =
    bm(id++, `namaPT${n}Id`, "", true) +
    runT("　", true) +
    bm(id++, `kakkoKerja${n}c`, "(", true) +
    bm(id++, `jenisKerja${n}Id`, "", true) +
    bm(id++, `kakkoKerja${n}d`, ")", true);
  return { xml: pKerja(jp) + pKerja(idLine), nextId: id };
}

function applyCell(rowXml: string, tcIndex: number, bodyXml: string): string {
  const tcs = getRowTcs(rowXml);
  if (tcs.length <= tcIndex) return rowXml;
  const tc = tcs[tcIndex];
  const next = replaceCellBody(tc.xml, bodyXml);
  return rowXml.slice(0, tc.start) + next + rowXml.slice(tc.end);
}

/** Hindari garis dobel: bottom baris kerja terakhir + top tebal section ⑨. */
function nilRowBottoms(rowXml: string): string {
  return rowXml.replace(
    /<w:bottom\b[^/]*\/>/g,
    '<w:bottom w:val="nil"/>',
  );
}

function patchEmptyRows(xml: string): string {
  const idx = xml.indexOf("学歴");
  const endIdx = xml.indexOf("修得等をしようとする技能等に係る職歴", idx);
  if (idx < 0 || endIdx < 0) return xml;

  const before = xml.slice(0, idx);
  const mid = xml.slice(idx, endIdx);
  const after = xml.slice(endIdx);

  const rowMeta: { start: number; end: number; xml: string }[] = [];
  const trRe = /<w:tr[\s>]/g;
  let m: RegExpExecArray | null;
  while ((m = trRe.exec(mid))) {
    const trStart = m.index;
    const trEnd = mid.indexOf("</w:tr>", trStart);
    if (trEnd < 0) break;
    rowMeta.push({ start: trStart, end: trEnd + 7, xml: mid.slice(trStart, trEnd + 7) });
    trRe.lastIndex = trEnd + 7;
  }

  let nextId = 900;
  const patched = rowMeta.map((r, i) => {
    const texts = [...r.xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((x) => x[1]).join("");
    return {
      ...r,
      i,
      isEduData1: r.xml.includes('w:name="namaSekolahJp1"'),
      isWorkHeader: texts.includes("職歴") && texts.includes("Pengalaman Kerja"),
      isWorkData1: r.xml.includes('w:name="namaPT1Jp"'),
      isEmpty: !texts.trim(),
      hasAnySekolahBm: /w:name="namaSekolahJp[2-4]"/.test(r.xml),
      hasAnyPtBm: /w:name="namaPT[2-5]Jp"/.test(r.xml),
    };
  });

  const edu1 = patched.findIndex((r) => r.isEduData1);
  const workHdr = patched.findIndex((r) => r.isWorkHeader);
  const work1 = patched.findIndex((r) => r.isWorkData1);
  if (edu1 < 0 || work1 < 0 || workHdr < 0) return xml;

  // Education data rows after row1 until work header (empty or previously injected)
  const eduTargets = patched.filter(
    (r, i) => i > edu1 && i < workHdr && (r.isEmpty || r.hasAnySekolahBm),
  );
  eduTargets.slice(0, 3).forEach((r, offset) => {
    const n = offset + 2;
    const period = eduPeriodBody(n, nextId);
    nextId = period.nextId;
    const name = eduNameBody(n, nextId);
    nextId = name.nextId;
    let newRow = applyCell(r.xml, 1, period.xml);
    newRow = applyCell(newRow, 2, name.xml);
    patched[r.i].xml = newRow;
  });

  const workTargets = patched.filter(
    (r, i) => i > work1 && (r.isEmpty || r.hasAnyPtBm),
  );
  workTargets.slice(0, 4).forEach((r, offset) => {
    const n = offset + 2;
    const period = kerjaPeriodBody(n, nextId);
    nextId = period.nextId;
    const name = kerjaNameBody(n, nextId);
    nextId = name.nextId;
    let newRow = applyCell(r.xml, 1, period.xml);
    newRow = applyCell(newRow, 2, name.xml);
    // Baris kerja terakhir (slot ke-5) — hilangkan bottom agar tidak numpuk dengan top ⑨
    if (offset === 3) newRow = nilRowBottoms(newRow);
    patched[r.i].xml = newRow;
  });

  // Jika template hanya punya < 4 empty rows, pastikan row kerja terakhir yang ada tetap tanpa bottom dobel
  if (workTargets.length > 0 && workTargets.length < 4) {
    const last = workTargets[workTargets.length - 1];
    patched[last.i].xml = nilRowBottoms(patched[last.i].xml);
  }

  let rebuilt = "";
  let cursor = 0;
  for (const r of patched) {
    rebuilt += mid.slice(cursor, r.start);
    rebuilt += r.xml;
    cursor = r.end;
  }
  rebuilt += mid.slice(cursor);
  return before + rebuilt + after;
}
