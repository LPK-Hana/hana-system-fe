'use client';

/**
 * Export CV sebagai PDF via window.print().
 *
 * Strategi: clone elemen #cv-template, convert semua gambar ke base64 (agar
 * bisa di-render di Blob URL), bungkus dalam HTML lengkap dengan @page A4,
 * buka di window baru, lalu trigger print.
 *
 * Hasilnya 1:1 dengan preview A4 di browser.
 */

async function embedImagesAsDataUrl(root: HTMLElement) {
  const images = root.querySelectorAll<HTMLImageElement>('img');
  await Promise.all(
    Array.from(images).map(async img => {
      const src = img.src;
      if (!src || src.startsWith('data:')) return;
      try {
        const resp = await fetch(src);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        // Gagal convert, biarkan src asli
      }
    }),
  );
}

function buildPrintHtml(bodyContent: string, title: string) {
  const safeTitle = title.replace(/\.pdf$/i, '');
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 210mm;
      margin: 0;
      padding: 0;
      background: #fff;
      font-family: "Noto Sans JP", "Meiryo", "MS Gothic", sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .cv-print-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 28px 24px;
      box-shadow: none !important;
      page-break-after: always;
      break-after: page;
    }

    .cv-print-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    @media print {
      html, body {
        width: 210mm;
      }
      .cv-print-page {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 28px 24px !important;
        box-shadow: none !important;
      }
    }

    @media screen {
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #e5e7eb;
        padding: 20px 0;
      }
      .cv-print-page {
        background: #fff;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        margin-bottom: 20px;
      }
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

function openPrintWindow(html: string, blobUrlToRevoke: string) {
  const printWindow = window.open(blobUrlToRevoke, '_blank');
  if (!printWindow) {
    alert('Popup diblokir browser. Izinkan popup untuk localhost lalu coba lagi.');
    URL.revokeObjectURL(blobUrlToRevoke);
    return;
  }

  printWindow.addEventListener('load', () => {
    const doc = printWindow.document;
    const triggerPrint = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    };

    if (doc.fonts?.ready) {
      doc.fonts.ready.then(triggerPrint);
    } else {
      setTimeout(triggerPrint, 1500);
    }
  });

  setTimeout(() => URL.revokeObjectURL(blobUrlToRevoke), 60_000);
}

export async function exportCVToPDF(elementId: string, fileName = 'CV') {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} tidak ditemukan.`);
    return;
  }

  const clone = el.cloneNode(true) as HTMLElement;
  await embedImagesAsDataUrl(clone);

  const title = fileName.replace(/\.pdf$/i, '');
  const bodyContent = `<div class="cv-print-page" id="${elementId}">${clone.innerHTML}</div>`;
  const html = buildPrintHtml(bodyContent, title);

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  openPrintWindow(html, blobUrl);
}

export async function bulkExportCVToPDF(
  items: { elementId: string; title?: string }[],
  fileName = 'CV_Bulk',
) {
  const pages: string[] = [];

  for (const item of items) {
    const el = document.getElementById(item.elementId);
    if (!el) {
      console.warn(`Element #${item.elementId} tidak ditemukan, dilewati.`);
      continue;
    }
    const clone = el.cloneNode(true) as HTMLElement;
    await embedImagesAsDataUrl(clone);
    pages.push(`<div class="cv-print-page" data-title="${item.title || item.elementId}">${clone.innerHTML}</div>`);
  }

  if (pages.length === 0) {
    alert('Tidak ada CV yang bisa diexport.');
    return;
  }

  const html = buildPrintHtml(pages.join('\n'), fileName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  openPrintWindow(html, blobUrl);
}
