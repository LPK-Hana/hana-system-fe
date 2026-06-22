import { PDFDocument, rgb, PDFName } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface JishuseiFormData {
  dateCreated: Date | null;
  romajiName: string;
  kanjiName: string;
  birthDate: Date | null;
  age: string;
  address: string;
  schoolStart: Date | null;
  schoolEnd: Date | null;
  schoolName: string;
  work1Start: Date | null;
  work1End: Date | null;
  work1Company: string;
  work2Start?: Date | null;
  work2End?: Date | null;
  work2Company?: string;
  jobType?: string;
  jobDuration?: string;
  country?: string;
  companyJapan?: string;
  cooperative?: string;
}

export async function generateJishuseiPdf(data: Partial<JishuseiFormData>): Promise<string> {
  // Fetch the original template
  const existingPdfBytes = await fetch('/templates/TEMPLATE DOKUMEN JISHUSEI.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Remove the yellow background boxes (Annotations) from all pages
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    page.node.delete(PDFName.of('Annots'));
  }

  // Register fontkit to use custom fonts
  pdfDoc.registerFontkit(fontkit);

  // Load Japanese Font to support Kanji/Kana
  const fontBytes = await fetch('/fonts/NotoSansJP-Regular.otf').then(res => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);

  // Setup basic drawing options
  const color = rgb(0, 0, 0); // Black text
  const size = 10;
  const font = customFont;

  // -- PAGE 1 --
  const p1 = pages[0];
  const { height } = p1.getSize();

  // Format Helpers
  const formatDate = (d: Date | null | undefined) => {
    if (!d) return '';
    return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`;
  };

  const formatMonthYear = (d: Date | null | undefined) => {
    if (!d) return '';
    return `${d.getFullYear()} / ${d.getMonth() + 1}`;
  };

  const formatFullBirthDate = (d: Date | null | undefined) => {
    if (!d) return '';
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  }

  // Draw text at coordinates
  // Note: PDF origin (0,0) is at the bottom-left. We use height - y to draw from the top.

  // 1. Date Created (Top Right)
  p1.drawText(formatDate(data.dateCreated), { x: 380, y: height - 128, size: 11, color, font });

  // 2. Identity Section
  // Romaji Name
  p1.drawText(data.romajiName ? data.romajiName.toUpperCase() : '', { x: 210, y: height - 183, size: 11, color, font });

  // Kanji Name
  p1.drawText(data.kanjiName || '', { x: 210, y: height - 210, size: 11, color, font });

  // Sex (Jenis Kelamin) - Example coordinate, can be adjusted
  // Assuming we strike out or circle based on gender, but we'll just write it for now

  // Birth Date
  const birthStr = data.birthDate ? `${formatFullBirthDate(data.birthDate)} （ ${data.age || ''} 歳 ）` : '';
  p1.drawText(birthStr, { x: 375, y: height - 210, size: 10, color, font });

  // Nationality
  p1.drawText('INDONESIA', { x: 220, y: height - 245, size: 11, color, font });

  // Mother Tongue
  p1.drawText('インドネシア語', { x: 375, y: height - 245, size: 11, color, font });

  // Address
  p1.drawText(data.address ? data.address.toUpperCase() : '', { x: 140, y: height - 285, size: 9, color, font });

  // 3. Education Section
  let eduY = height - 378;
  const schoolPeriod = (data.schoolStart || data.schoolEnd) ? `${formatMonthYear(data.schoolStart)} ～ ${formatMonthYear(data.schoolEnd)}` : '';
  p1.drawText(schoolPeriod, { x: 60, y: eduY, size: 10, color, font });
  p1.drawText(data.schoolName || '', { x: 180, y: eduY, size: 10, color, font });

  // 4. Work Experience Section
  let workY = height - 540;
  const work1Period = (data.work1Start || data.work1End) ? `${formatMonthYear(data.work1Start)} ～ ${formatMonthYear(data.work1End)}` : '';
  p1.drawText(work1Period, { x: 60, y: workY, size: 10, color, font });
  p1.drawText(data.work1Company || '', { x: 180, y: workY, size: 10, color, font });

  if (data.work2Company || data.work2Start) {
    let workY2 = workY - 26;
    const work2Period = (data.work2Start || data.work2End) ? `${formatMonthYear(data.work2Start)} ～ ${formatMonthYear(data.work2End)}` : '';
    p1.drawText(work2Period, { x: 60, y: workY2, size: 10, color, font });
    p1.drawText(data.work2Company || '', { x: 180, y: workY2, size: 10, color, font });
  }

  // Save the modified document
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
