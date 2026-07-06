export async function exportPage1ToPdf(elementId: string, filename: string): Promise<void> {
  await document.fonts.ready;

  const element = document.getElementById(elementId);
  if (!element) throw new Error('Dokumen tidak ditemukan.');

  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  pdf.save(filename);
}
