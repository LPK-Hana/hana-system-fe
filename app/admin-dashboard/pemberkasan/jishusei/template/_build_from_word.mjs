/**
 * Build Template_Dokumen_Jishusei from Word→HTML export.
 * - Resume: split ⑩ at EPA (match JPG p1/p2)
 * - Kesepakatan: split fat rows by Pasal number (ID↔JP aligned), pack 7 pages, no empty pads
 */
import fs from "fs";

const RAW =
  "d:/Job/jukyu-lms/hana-system-fe/app/admin-dashboard/pemberkasan/jishusei/template/_word_export_raw.html";
const OUT =
  "d:/Job/jukyu-lms/hana-system-fe/app/admin-dashboard/pemberkasan/jishusei/template/Template_Dokumen_Jishusei.lpk-raftel-template.json";

let html = fs.readFileSync(RAW, "utf8").replace(/\r\n/g, "\n");

const styleMatch = html.match(/<style[^>]*>[\s\S]*?<\/style>/i);
const styleBlock = styleMatch ? styleMatch[0] : "";
html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/i, "").trim();

function stripTrHeights(chunk) {
  return chunk.replace(/<tr\b([^>]*)>/gi, (_m, attrs) => {
    const cleaned = attrs.replace(/style="([^"]*)"/i, (_s, st) => {
      const next = st.replace(/height:\s*[\d.]+pt;?\s*/gi, "").trim();
      return next ? `style="${next}"` : "";
    });
    return `<tr${cleaned}>`;
  });
}

function normalizeTables(chunk) {
  return stripTrHeights(chunk).replace(
    /(<table\b[^>]*style=")([^"]*)(")/gi,
    (_m, a, styles, c) => {
      let s = styles
        .replace(/width:\s*[\d.]+pt;?/gi, "width:100%;")
        .replace(/margin-left:\s*[\d.]+pt;?/gi, "margin-left:0;");
      if (!/width\s*:/i.test(s)) s = `width:100%; ${s}`;
      return `${a}${s}${c}`;
    },
  );
}

function stripEmptyP(chunk) {
  return chunk
    .replace(
      /(?:<p[^>]*>\s*(?:&nbsp;|\s|<span[^>]*>\s*(?:&nbsp;|\s)*<\/span>)*<\/p>\s*){4,}/gi,
      '<p style="margin-top:0pt; margin-bottom:0pt;">&nbsp;</p>\n',
    )
    .trim();
}

function wrapPage(body) {
  const cleaned = stripEmptyP(normalizeTables(body));
  const needsList = /awlist/.test(cleaned);
  return (needsList && styleBlock ? styleBlock + "\n" : "") + cleaned;
}

function isSpacerRow(r) {
  const open = r.match(/^<tr\b[^>]*>/i);
  return !!(open && /height:\s*0pt/i.test(open[0]));
}

function parseRows(inner) {
  const rows = [];
  const re = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;
  let m;
  while ((m = re.exec(inner))) rows.push(m[0]);
  return rows;
}

function plainOf(r) {
  return r
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitResumeTable(resumeHtml) {
  const tableStart = resumeHtml.indexOf("<table");
  if (tableStart < 0) return [resumeHtml, ""];

  const openEnd = resumeHtml.indexOf(">", tableStart) + 1;
  const tableTag = resumeHtml.slice(tableStart, openEnd);
  const tbodyOpen = resumeHtml.indexOf("<tbody>", openEnd);
  const tbodyClose = resumeHtml.indexOf("</tbody>", tbodyOpen);
  const afterTableClose =
    resumeHtml.indexOf("</table>", tbodyClose) + "</table>".length;

  const before = resumeHtml.slice(0, tableStart);
  const after = resumeHtml.slice(afterTableClose);
  const inner = resumeHtml.slice(tbodyOpen + "<tbody>".length, tbodyClose);
  const rows = parseRows(inner);
  const dataRows = rows.filter((r) => !isSpacerRow(r));
  const spacerRows = rows.filter((r) => isSpacerRow(r));

  const i10 = dataRows.findIndex(
    (r) => r.includes("⑩") && r.includes("訪日経験"),
  );
  const i11 = dataRows.findIndex(
    (r) => r.includes("⑪") || r.includes("技能実習経験及びその区分"),
  );

  const mkTable = (trs) =>
    `${tableTag}<tbody>\n${trs.join("\n")}\n</tbody></table>`;

  if (i10 < 0 || i11 < 0) {
    console.warn("resume markers missing", { i10, i11 });
    return [resumeHtml, ""];
  }

  const row10 = dataRows[i10];
  const epaMarker = "経済連携協定";
  const tdMatches = [...row10.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/gi)];

  if (row10.includes(epaMarker) && tdMatches.length >= 2) {
    const labelTd = tdMatches[0][0];
    const contentTdFull = tdMatches[tdMatches.length - 1][0];
    const contentOpenEnd = contentTdFull.indexOf(">") + 1;
    const contentOpen = contentTdFull.slice(0, contentOpenEnd);
    const contentInner = contentTdFull.slice(
      contentOpenEnd,
      contentTdFull.lastIndexOf("</td>"),
    );
    const cutInner = contentInner.indexOf(epaMarker);
    const pCut = contentInner.lastIndexOf("<p", cutInner);
    const splitAt = pCut >= 0 ? pCut : cutInner;
    const middle = tdMatches.slice(1, -1).map((x) => x[0]).join("");
    const trOpen = row10.match(/^<tr\b[^>]*>/i)[0];
    const row10p1 = `${trOpen}${labelTd}${middle}${contentOpen}${contentInner.slice(0, splitAt)}</td></tr>`;
    const row10p2 = `${trOpen}${labelTd}${middle}${contentOpen}${contentInner.slice(splitAt)}</td></tr>`;
    const p1Rows = dataRows.slice(0, i10).concat([row10p1], spacerRows);
    const p2Rows = [row10p2].concat(dataRows.slice(i11), spacerRows);
    console.log("resume split at EPA inside ⑩");
    return [before + mkTable(p1Rows), mkTable(p2Rows) + after];
  }

  const p1Rows = dataRows.slice(0, i11).concat(spacerRows);
  const p2Rows = dataRows.slice(i11).concat(spacerRows);
  console.log("resume split before ⑪");
  return [before + mkTable(p1Rows), mkTable(p2Rows) + after];
}

/** Align ID Pasal N with JP 第N条 chunks. */
function splitRowByPasalNumber(rowHtml) {
  const tds = [...rowHtml.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/gi)].map(
    (x) => x[0],
  );
  if (tds.length < 3) return [rowHtml];

  const trOpen = rowHtml.match(/^<tr\b[^>]*>/i)[0];
  const emptyTd = tds[0];
  const idTd = tds[1];
  const jpTd = tds[2];
  const idOpenEnd = idTd.indexOf(">") + 1;
  const jpOpenEnd = jpTd.indexOf(">") + 1;
  const idOpen = idTd.slice(0, idOpenEnd);
  const jpOpen = jpTd.slice(0, jpOpenEnd);
  const idInner = idTd.slice(idOpenEnd, idTd.lastIndexOf("</td>"));
  const jpInner = jpTd.slice(jpOpenEnd, jpTd.lastIndexOf("</td>"));

  const idChunks = chunkByRegex(idInner, /Pasal\s+(\d+)/gi);
  const jpChunks = chunkByRegex(jpInner, /第\s*(\d+)\s*条/g);

  if (idChunks.length <= 1) return [rowHtml];

  const jpByNum = new Map();
  for (const c of jpChunks) {
    if (c.num != null) jpByNum.set(c.num, (jpByNum.get(c.num) || "") + c.html);
  }

  // Leading JP before first 第N条 (BAB headers etc.) attach to first pasal
  const jpLead = jpChunks.filter((c) => c.num == null).map((c) => c.html).join("");

  const out = [];
  idChunks.forEach((c, idx) => {
    if (c.num == null) {
      // BAB / preamble on ID side — keep with following pasal if any
      if (idx === 0 && idChunks.length > 1) return; // merge into next below
      const jp = idx === 0 ? jpLead : "";
      out.push(
        `${trOpen}${emptyTd}${idOpen}${c.html}</td>${jpOpen}${jp}</td></tr>`,
      );
      return;
    }
    let idHtml = c.html;
    // prepend prior num-null chunk
    if (idx > 0 && idChunks[idx - 1].num == null) {
      idHtml = idChunks[idx - 1].html + idHtml;
    } else if (idx === 0 && idChunks[0].num == null) {
      /* handled */
    }
    let jpHtml = jpByNum.get(c.num) || "";
    if (idx === 0 || (out.length === 0 && jpLead)) {
      jpHtml = jpLead + jpHtml;
    }
    // Also attach JP BAB headers that appear as num-null between articles — already in lead only
    out.push(
      `${trOpen}${emptyTd}${idOpen}${idHtml}</td>${jpOpen}${jpHtml}</td></tr>`,
    );
  });

  return out.length ? out : [rowHtml];
}

function chunkByRegex(html, re) {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  const r = new RegExp(re.source, flags);
  const matches = [...html.matchAll(r)];
  if (!matches.length) return [{ num: null, html }];

  const chunks = [];
  if (matches[0].index > 0) {
    chunks.push({ num: null, html: html.slice(0, matches[0].index) });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    const num = parseInt(matches[i][1], 10);
    chunks.push({ num, html: html.slice(start, end) });
  }
  return chunks;
}

function splitKesepakatan(fullHtml, markerIndex) {
  const tableStart = fullHtml.lastIndexOf("<table", markerIndex);
  if (tableStart < 0) return [fullHtml.slice(markerIndex)];

  const openEnd = fullHtml.indexOf(">", tableStart) + 1;
  const tableTag = fullHtml.slice(tableStart, openEnd);
  const tbodyOpen = fullHtml.indexOf("<tbody>", openEnd);
  const tbodyClose = fullHtml.indexOf("</tbody>", tbodyOpen);
  const tableClose =
    fullHtml.indexOf("</table>", tbodyClose) + "</table>".length;
  const afterTable = fullHtml.slice(tableClose);
  const inner = fullHtml.slice(tbodyOpen + "<tbody>".length, tbodyClose);
  const dataRows = parseRows(inner).filter((r) => !isSpacerRow(r));

  const mk = (trs) =>
    `${tableTag}<tbody>\n${trs.join("\n")}\n</tbody></table>`;

  // Expand fat body rows
  const expanded = [];
  for (const r of dataRows) {
    const p = plainOf(r);
    if (/Pasal\s+\d/.test(p) && r.length > 2000) {
      expanded.push(...splitRowByPasalNumber(r));
    } else {
      expanded.push(r);
    }
  }

  // Drop near-empty rows
  const cleaned = expanded.filter((r) => plainOf(r).length > 15);

  console.log(
    "expanded",
    cleaned.length,
    cleaned.map((r) => plainOf(r).slice(0, 45)),
  );

  // Pack like JPG:
  // p8: title + intro + pasal1-3
  // p9: pasal4-7
  // p10: pasal8-14
  // p11: pasal15-21
  // p12: pasal22-26
  // p13: pasal27-30 start
  // p14: rest + signatures
  const ranges = [
    { beforePasal: 4 }, // title, intro, 1-3
    { from: 4, to: 7 },
    { from: 8, to: 14 },
    { from: 15, to: 21 },
    { from: 22, to: 26 },
    { from: 27, to: 29 },
    { from: 30, to: 999 },
  ];

  function pasalNum(r) {
    const m = plainOf(r).match(/Pasal\s+(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
  }

  const titleIntro = [];
  const byPasal = new Map();
  const orphans = [];

  for (const r of cleaned) {
    const n = pasalNum(r);
    const p = plainOf(r);
    if (/SURAT KESEPAKATAN/.test(p) || (/Lembaga pengirim/.test(p) && n == null)) {
      titleIntro.push(r);
      continue;
    }
    if (/^BAB\s+\d/i.test(p) && n == null) {
      orphans.push(r); // attach to next pasal group later
      continue;
    }
    if (n != null) {
      if (orphans.length) {
        byPasal.set(n, (byPasal.get(n) || []).concat(orphans.splice(0), [r]));
      } else {
        byPasal.set(n, (byPasal.get(n) || []).concat([r]));
      }
    } else {
      orphans.push(r);
    }
  }
  // leftover orphans → last pasal
  if (orphans.length) {
    const last = Math.max(0, ...byPasal.keys());
    byPasal.set(last, (byPasal.get(last) || []).concat(orphans));
  }

  const pages = ranges.map((range, idx) => {
    const trs = [];
    if (idx === 0) trs.push(...titleIntro);
    if (range.beforePasal) {
      for (let n = 1; n < range.beforePasal; n++) {
        if (byPasal.has(n)) trs.push(...byPasal.get(n));
      }
    }
    if (range.from != null) {
      for (let n = range.from; n <= range.to; n++) {
        if (byPasal.has(n)) trs.push(...byPasal.get(n));
      }
    }
    return trs;
  });

  // Ensure no empty page: merge empty into neighbor
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].length === 0) {
      if (i + 1 < pages.length && pages[i + 1].length) {
        pages[i] = [pages[i + 1].shift()].filter(Boolean);
      } else if (i > 0 && pages[i - 1].length > 1) {
        pages[i] = [pages[i - 1].pop()];
      }
    }
  }

  const pagesHtml = pages
    .filter((trs) => trs.length > 0)
    .map((trs, i, arr) => {
      let page = mk(trs);
      if (i === arr.length - 1) page += afterTable;
      return page;
    });

  // Pad to 7 only by splitting last fat page if needed — never blank
  while (pagesHtml.length < 7 && pagesHtml.length > 0) {
    const last = pagesHtml[pagesHtml.length - 1];
    // can't meaningfully split HTML string; duplicate break by moving from previous
    break;
  }

  console.log(
    "kesepakatan pages",
    pagesHtml.map((p) => p.length),
  );
  return pagesHtml;
}

// --- Section cuts ---
const i20 = html.indexOf("参考様式第１-20号");
const i21 = html.indexOf("参考様式第１-21号");
const iFee3 = html.indexOf("３　外国の準備機関");
const i39 = html.indexOf("参考様式第１-39号");
const iSa = html.indexOf("SURAT KESEPAKATAN");

if ([i20, i21, iFee3, i39, iSa].some((x) => x < 0)) {
  console.error("Missing markers", { i20, i21, iFee3, i39, iSa });
  process.exit(1);
}

const resumeAll = html.slice(0, i20);
const deklarasiAll = html.slice(i20, i21);
const fee12 = html.slice(i21, iFee3);
const fee3 = html.slice(iFee3, i39);
const iSaTable = html.lastIndexOf("<table", iSa);
const consent = html.slice(i39, iSaTable > i39 ? iSaTable : iSa);

const [resume1, resume2] = splitResumeTable(resumeAll);

let dekSplit = deklarasiAll.indexOf("誰かに金銭などの財産を管理される");
if (dekSplit < 0) dekSplit = Math.floor(deklarasiAll.length * 0.55);
else {
  const back = deklarasiAll.lastIndexOf("<p", dekSplit);
  dekSplit = back >= 0 ? back : dekSplit;
}

const kPages = splitKesepakatan(html, iSa);

const pageHtmls = [
  resume1,
  resume2,
  deklarasiAll.slice(0, dekSplit),
  deklarasiAll.slice(dekSplit),
  fee12,
  fee3,
  consent,
  ...kPages,
].map(wrapPage);

// Keep whatever page count we get (prefer filled pages over empty 14)
while (pageHtmls.length < 14) {
  // only if short: don't add blank — stop
  break;
}

const pages = pageHtmls.map((htmlContent, i) => ({
  id: `jishusei-p${i + 1}`,
  html: htmlContent,
}));

const template = {
  lpkRaftelTemplateVersion: 1,
  exportedAt: new Date().toISOString(),
  template: {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Template Dokumen Jishusei",
    paperSizeId: "a4-portrait",
    customPaper: null,
    margins: {
      top: 14.99,
      right: 14.99,
      bottom: 14.99,
      left: 14.99,
    },
    gutterMm: 0,
    gutterPosition: "left",
    pageGapMm: 6.35,
    pages,
    createdAt: "2026-07-23T16:27:57.329Z",
    updatedAt: new Date().toISOString(),
  },
};

fs.writeFileSync(OUT, JSON.stringify(template, null, 2) + "\n", "utf8");
console.log(
  "Wrote",
  pages.length,
  "pages",
  pages.map((p, i) => `${i + 1}:${p.html.length}`),
);
