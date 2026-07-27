import fs from "fs";

const transcript =
  "C:/Users/Ziddan/.cursor/projects/d-Job-jukyu-lms/agent-transcripts/3ba1880e-891e-4331-b9ad-f2da93486c98/3ba1880e-891e-4331-b9ad-f2da93486c98.jsonl";
const out =
  "d:/Job/jukyu-lms/hana-system-fe/app/admin-dashboard/pemberkasan/jishusei/template/_word_export_raw.html";

const lines = fs.readFileSync(transcript, "utf8").split("\n");
let found = null;

for (let i = lines.length - 1; i >= 0; i--) {
  try {
    const o = JSON.parse(lines[i]);
    const c = o?.message?.content;
    if (!c) continue;
    const text = Array.isArray(c)
      ? c.map((x) => x.text || "").join("")
      : typeof c === "string"
        ? c
        : "";
    if (
      text.includes("wordtohtml.net") &&
      text.includes("<style") &&
      text.includes("SURAT KESEPAKATAN")
    ) {
      const s = text.indexOf("<style");
      const e = text.indexOf('<p style="bottom: 10px');
      found = e > s ? text.slice(s, e) : text.slice(s);
      console.log("found at line", i, "len", found.length);
      break;
    }
  } catch {
    // skip
  }
}

if (!found) {
  console.error("HTML not found in transcript");
  process.exit(1);
}

fs.writeFileSync(out, found, "utf8");
console.log("wrote", out, "bytes", fs.statSync(out).size);
