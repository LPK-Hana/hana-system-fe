import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { spawnSync } from "child_process";
import {
  fillJishuseiDocx,
  type JishuseiFormData,
} from "@/app/admin-dashboard/pemberkasan/jishusei/lib/fillJishuseiDocx";

export const runtime = "nodejs";

const TEMPLATE_REL =
  "app/admin-dashboard/pemberkasan/jishusei/Dokumen_Jishusei(kosong).docx";

function templatePath() {
  return path.join(process.cwd(), TEMPLATE_REL);
}

function readTemplate(): Buffer {
  const p = templatePath();
  if (!fs.existsSync(p)) {
    throw new Error(`Template not found: ${p}`);
  }
  return fs.readFileSync(p);
}

function convertDocxToPdfWithWord(docxPath: string, pdfPath: string): void {
  // Avoid [ref] SaveAs — it breaks under PowerShell COM. Use SaveAs2(format=17 PDF).
  const ps = `
$ErrorActionPreference = 'Stop'
$docxPath = ${JSON.stringify(docxPath)}
$pdfPath = ${JSON.stringify(pdfPath)}
$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($docxPath, $false, $true)
  $null = $doc.SaveAs2($pdfPath, 17)
  $doc.Close($false)
  $doc = $null
} catch {
  Write-Error $_.Exception.Message
  exit 1
} finally {
  if ($doc -ne $null) { try { $doc.Close($false) } catch {} }
  if ($word -ne $null) {
    try { $word.Quit() } catch {}
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null } catch {}
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
if (-not (Test-Path -LiteralPath $pdfPath)) { Write-Error 'PDF file was not created'; exit 1 }
Write-Output 'OK'
`;
  const scriptFile = path.join(os.tmpdir(), `raftel-docx2pdf-${Date.now()}.ps1`);
  fs.writeFileSync(scriptFile, "\uFEFF" + ps, "utf8");

  const powershellExe = path.join(
    process.env.SystemRoot || "C:\\Windows",
    "System32",
    "WindowsPowerShell",
    "v1.0",
    "powershell.exe",
  );

  const r = spawnSync(
    powershellExe,
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptFile],
    { encoding: "utf8", timeout: 180000, windowsHide: true },
  );

  try {
    fs.unlinkSync(scriptFile);
  } catch {
    /* ignore */
  }

  const detail = [r.stderr, r.stdout].filter(Boolean).join("\n").trim();
  if (r.error) {
    throw new Error(`Gagal menjalankan PowerShell: ${r.error.message}`);
  }
  if (r.status !== 0 || !fs.existsSync(pdfPath)) {
    throw new Error(
      detail ||
        "Konversi PDF gagal. Pastikan Microsoft Word bisa dibuka, lalu coba lagi. Alternatif: unduh DOCX → Save as PDF di Word.",
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const format = (body.format as string) || "docx";
    const data = body.data as JishuseiFormData;

    if (!data?.namaLengkap) {
      return NextResponse.json(
        { error: "namaLengkap wajib diisi" },
        { status: 400 },
      );
    }

    const filled = fillJishuseiDocx(readTemplate(), data);
    const safeName = String(data.namaLengkap || "dokumen")
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 40);
    const baseName = `Dokumen_Jishusei_${safeName || "dokumen"}`;

    if (format === "docx") {
      return new NextResponse(Buffer.from(filled), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${baseName}.docx"`,
        },
      });
    }

    if (format === "pdf") {
      const tmp = os.tmpdir();
      const stamp = Date.now();
      const docxPath = path.join(tmp, `raftel-jishusei-${stamp}.docx`);
      const pdfPath = path.join(tmp, `raftel-jishusei-${stamp}.pdf`);
      fs.writeFileSync(docxPath, Buffer.from(filled));
      try {
        convertDocxToPdfWithWord(docxPath, pdfPath);
        const pdfBuf = fs.readFileSync(pdfPath);
        return new NextResponse(pdfBuf, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
          },
        });
      } finally {
        try {
          fs.unlinkSync(docxPath);
        } catch {
          /* ignore */
        }
        try {
          fs.unlinkSync(pdfPath);
        } catch {
          /* ignore */
        }
      }
    }

    return NextResponse.json(
      { error: "format harus docx atau pdf" },
      { status: 400 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[jishusei generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
