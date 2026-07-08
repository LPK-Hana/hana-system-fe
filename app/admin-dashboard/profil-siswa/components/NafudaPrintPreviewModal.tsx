import { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { type StudentEditData } from './StudentEditModal';
import NameCard from '../../../student-dashboard/testingpage/NameCard';

/** Tampilan kelas di flashcard: satu huruf → "B クラス", selain itu apa adanya. */
function formatKelasForCard(kelas: string): string {
  const t = kelas.trim();
  if (!t || t === '-') return '-';
  if (/^[A-Za-z]$/.test(t)) return `${t.toUpperCase()} クラス`;
  return t;
}

interface NafudaPrintPreviewModalProps {
  students: StudentEditData[];
  onClose: () => void;
}

export default function NafudaPrintPreviewModal({ students, onClose }: NafudaPrintPreviewModalProps) {
  const cardsPerPage = 10;
  const pages = [];

  for (let i = 0; i < students.length; i += cardsPerPage) {
    pages.push(students.slice(i, i + cardsPerPage));
  }

  const handlePrint = async () => {
    const el = document.getElementById('nafuda-print-container');
    if (!el) return;

    // 1. Deep clone
    const clone = el.cloneNode(true) as HTMLElement;

    // 2. Convert images to base64 so they load in Blob URL
    const images = clone.querySelectorAll<HTMLImageElement>('img');
    await Promise.all(
      Array.from(images).map(async (img) => {
        const src = img.src;
        if (src.startsWith('data:')) return;
        try {
          const resp = await fetch(src);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          img.src = dataUrl;
        } catch {
          // ignore errors
        }
      })
    );

    // 3. Build HTML
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Cetak Nafuda</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Barlow:wght@700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0mm;
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
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    #nafuda-print-container {
      width: 100%;
      background: white !important;
      display: flex;
      flex-direction: column;
      gap: 0 !important;
    }
    
    .print-page {
      width: 210mm !important;
      height: 297mm !important;
      page-break-after: always;
      margin: 0 !important;
      padding: 5mm 15mm !important;
      box-sizing: border-box;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nafuda-card {
      border: 1px dashed #ccc !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Tailwind polyfill for the cloned elements */
    .w-full { width: 100% !important; }
    .h-full { height: 100% !important; }
    .grid { display: grid !important; }
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    .items-center { align-items: center !important; }
    .justify-center { justify-content: center !important; }
    .mx-auto { margin-left: auto !important; margin-right: auto !important; }
    .relative { position: relative !important; }
    .overflow-hidden { overflow: hidden !important; }
    .box-border { box-sizing: border-box !important; }
    .bg-white { background-color: white !important; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

    // 4. Create Blob & Open Window
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');

    if (!printWindow) {
      alert('Popup diblokir browser. Izinkan popup untuk mencetak.');
      URL.revokeObjectURL(blobUrl);
      return;
    }

    // 5. Auto-print on load
    printWindow.addEventListener('load', () => {
      const doc = printWindow.document;
      const triggerPrint = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 400);
      };

      if (doc.fonts && doc.fonts.ready) {
        doc.fonts.ready.then(triggerPrint);
      } else {
        setTimeout(triggerPrint, 1500);
      }
    });

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  useEffect(() => {
    // Add print specific styles to body when component mounts
    document.body.classList.add('printing-nafuda');
    return () => {
      document.body.classList.remove('printing-nafuda');
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col print:static print:h-auto print:w-auto print:overflow-visible">


      {/* Header Modal */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b shadow-sm shrink-0 print:hidden">
        <div>
          <h2 className="text-xl font-serif text-gray-900">Preview Cetak Nafuda</h2>
          <p className="text-sm text-gray-500">Kertas: A4 (Portrait) • {students.length} Siswa • {pages.length} Halaman</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors"
          >
            <Printer size={18} />
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* Preview Area (Scrollable) */}
      <div className="flex-1 overflow-auto bg-gray-200 p-8 flex flex-col items-center gap-8 print:overflow-visible print:block print:p-0 print:bg-white">
        <div id="nafuda-print-container" className="flex flex-col gap-8 bg-gray-200 print:bg-white print:gap-0">
          {pages.map((pageStudents, pageIndex) => (
            <div
              key={pageIndex}
              className="print-page w-[210mm] h-[297mm] bg-white shadow-xl mx-auto flex items-center justify-center p-[5mm] print:p-0 box-border"
              style={{
                // Scale down slightly for screen viewing to fit nicely, but actual size in print
                transform: 'scale(1)',
                transformOrigin: 'top center'
              }}
            >
              <div
                className="w-full h-full grid"
                style={{
                  gridTemplateColumns: 'repeat(2, 85.6mm)',
                  gridTemplateRows: 'repeat(5, 53.98mm)',
                  gap: '3mm 8mm', // gap between cards
                  justifyContent: 'center',
                  alignContent: 'center'
                }}
              >
                {pageStudents.map((student) => (
                  <div
                    key={student.id}
                    className="nafuda-card bg-white overflow-hidden relative box-border"
                    style={{
                      width: '85.6mm',
                      height: '53.98mm'
                    }}
                  >
                    <NameCard
                      studentId={student.no_peserta || '-'}
                      nameRomaji={student.nama_lengkap.toUpperCase()}
                      nameJapanese={student.nama_katakana || '-'}
                      classJapanese={formatKelasForCard(student.tempat_belajar && student.tempat_belajar !== '-' ? student.tempat_belajar : (student.angkatan || '-'))}
                      phone={student.telepon || '-'}
                      email={student.email || '-'}
                      address={student.alamat || '-'}
                      photoUrl={student.foto || undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
