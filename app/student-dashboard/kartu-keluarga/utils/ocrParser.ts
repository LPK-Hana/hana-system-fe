import toast from 'react-hot-toast';
import { KkFormData, emptyMember } from '../types';
import {
  buildOcrWordsFromAnnotations,
  OcrWord,
  parseBasicInfo,
  reconstructColumnAwareText,
  stripKepalaNameWordsFromAddress,
} from './kkOcrBasicInfo';
import { parseMembersFromOcr } from './kkOcrMembers';

const compressImage = (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const parseKkDocument = async (
  file: File,
  prevFormData: KkFormData,
  setOcrLoading: (loading: boolean) => void
): Promise<KkFormData | null> => {
  setOcrLoading(true);
  try {
    let text = '';
    let ocrWords: OcrWord[] | null = null;

    try {
      let fileToSend: Blob = file;
      if (file.type.startsWith('image/')) {
        try {
          toast.loading("Mengompresi gambar...", { id: 'ocr-toast' });
          fileToSend = await compressImage(file);
        } catch (compressErr) {
          console.error("Gagal mengompresi gambar, menggunakan file asli:", compressErr);
        }
      }

      const formDataObj = new FormData();
      formDataObj.append('file', fileToSend, file.name);

      toast.loading("Menganalisis gambar (Google Vision)...", { id: 'ocr-toast' });

      const authToken =
        typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formDataObj,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          text = data.text;

          if (data.annotations && data.annotations.length > 1) {
            const words = data.annotations.slice(1);

            let totalWeight = 0;
            let totalAngle = 0;

            words.forEach((w: any) => {
              const v = w.boundingPoly?.vertices;
              if (v && v.length >= 2) {
                const x0 = v[0].x || 0;
                const y0 = v[0].y || 0;
                const x1 = v[1].x || 0;
                const y1 = v[1].y || 0;

                const dx = x1 - x0;
                const dy = y1 - y0;
                const length = Math.sqrt(dx * dx + dy * dy);

                if (length > 15) {
                  const angle = Math.atan2(dy, dx);
                  if (Math.abs(angle) < Math.PI / 4) {
                    totalAngle += angle * length;
                    totalWeight += length;
                  }
                }
              }
            });

            const skewAngle = totalWeight > 0 ? totalAngle / totalWeight : 0;

            ocrWords = buildOcrWordsFromAnnotations(words, skewAngle);
            text = reconstructColumnAwareText(ocrWords);
          }
          console.log("=== RAW OCR TEXT ===");
          console.log(text);
          toast.success("Berhasil dianalisis menggunakan Google Cloud Vision API!", { id: 'ocr-toast' });
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || response.statusText;
        toast.error(`Google Vision gagal: ${errMsg}`, { id: 'ocr-toast', duration: 5000 });
      }
    } catch (err: any) {
      toast.error(`Koneksi ke API gagal. Silakan coba lagi.`, { id: 'ocr-toast' });
    }

    if (!text) {
      setOcrLoading(false);
      return null;
    }

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    let basicInfo = parseBasicInfo(lines);

    let {
      kepalaKeluarga,
      alamat,
      rtRw,
      kelurahan,
      kecamatan,
      kabKota,
      kodePos,
      provinsi,
    } = basicInfo;

    if (!kodePos) kodePos = text.match(/\b\d{5}\b/)?.[0] || '';
    if (!rtRw) rtRw = text.match(/\b\d{2,3}\s*\/\s*\d{2,3}\b/)?.[0]?.replace(/\s+/g, '') || '';

    const allNiks = text.match(/\b\d{16}\b/g) || [];
    const kkNumber = allNiks[0] || '';

    const newMembers = parseMembersFromOcr(lines, kkNumber, ocrWords, emptyMember);

    const kepalaMember = newMembers.find((m) => /KEPALA\s*KELUARGA/i.test(m.relationship));
    if (kepalaMember?.name) {
      kepalaKeluarga = kepalaMember.name;
      if (alamat && kepalaMember.name) {
        alamat = stripKepalaNameWordsFromAddress(alamat, kepalaMember.name);
      }
    } else if (!kepalaKeluarga && newMembers[0]?.name) {
      kepalaKeluarga = newMembers[0].name;
    }

    const allDates = text.match(/\b\d{2}[-/.]\d{2}[-/.]\d{4}\b/g) || [];
    const issueDateMatch = allDates.length > newMembers.filter((m) => m.nik).length ? allDates[allDates.length - 1] : '';
    const nipMatch = text.match(/\b\d{18}\b/);
    const nip = nipMatch ? nipMatch[0] : '';

    let finalIssueDate = prevFormData.footer.issueDate;
    let finalIssueMonth = prevFormData.footer.issueMonth;
    let finalIssueYear = prevFormData.footer.issueYear;

    if (issueDateMatch) {
      const parts = issueDateMatch.split('-');
      if (parts.length === 3) {
        finalIssueDate = parts[0];
        finalIssueMonth = parts[1];
        finalIssueYear = parts[2];
      }
    }

    let kadisName = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      const upperLine = lines[i].toUpperCase();
      if (upperLine.includes('NIP') || /\b\d{18}\b/.test(lines[i])) {
        for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
          const prev = lines[j].trim();
          if (prev && !prev.toUpperCase().includes('NIP') && !prev.toUpperCase().includes('PENCATATAN SIPIL') && !/\b\d{18}\b/.test(prev) && prev.length > 3) {
            let cleanedPrev = prev.replace(/Tanda Tangan\/Cap Jempol/gi, '').replace(/Tanda Tangan/gi, '').trim();

            // Perbaiki bug dimana OCR menggabungkan nama Kepala Keluarga (kiri) dengan Kadis (kanan) karena sejajar horizontal
            if (kepalaKeluarga) {
              const safeKkName = kepalaKeluarga.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              cleanedPrev = cleanedPrev.replace(new RegExp(safeKkName, 'gi'), '').trim();
            }

            // Bersihkan sisa karakter aneh di depan akibat pemotongan
            kadisName = cleanedPrev.replace(/^[,.\-\s]+/, '').trim();
            if (kadisName.length > 3) break;
          }
        }
        if (kadisName) break;
      }
    }

    setOcrLoading(false);
    toast.success("Data berhasil diekstrak dan digabungkan!");

    console.log("=== DATA TEREKSTRAK ===");
    console.table({
      "No KK": kkNumber || prevFormData.header.number,
      "Kepala Keluarga": kepalaKeluarga || prevFormData.basic.kepalaKeluarga,
      "Alamat": alamat || prevFormData.basic.alamat,
      "RT/RW": rtRw || prevFormData.basic.rtRw,
      "Desa/Kelurahan": kelurahan || prevFormData.basic.kelurahan,
      "Kecamatan": kecamatan || prevFormData.basic.kecamatan,
      "Kab/Kota": kabKota || prevFormData.basic.kabKota,
      "Kode Pos": kodePos || prevFormData.basic.kodePos,
      "Provinsi": provinsi || prevFormData.basic.provinsi,
    });
    console.log("=== ANGGOTA KELUARGA ===");
    const filledMembers = newMembers.filter(m => m.name || m.nik);
    if (filledMembers.length > 0) {
      console.table(filledMembers.map((m, i) => ({
        "No": i + 1,
        "Nama": m.name,
        "NIK": m.nik,
        "L/P": m.gender,
        "Tmp Lahir": m.pob,
        "Tgl Lahir": m.dob,
        "Agama": m.religion,
        "Pendidikan": m.education,
        "Pekerjaan": m.occupation,
        "Gol. Darah": m.bloodType,
        "Status Kawin": m.maritalStatus,
        "Tgl Kawin": m.marriageDate,
        "Hubungan": m.relationship,
        "Warganegara": m.nationality,
        "Ayah": m.father,
        "Ibu": m.mother
      })));
    } else {
      console.log("Tidak ada anggota keluarga yang terbaca.");
    }

    return {
      header: { number: kkNumber || prevFormData.header.number },
      basic: {
        kepalaKeluarga: kepalaKeluarga || prevFormData.basic.kepalaKeluarga,
        alamat: alamat || prevFormData.basic.alamat,
        rtRw: rtRw || prevFormData.basic.rtRw,
        kelurahan: kelurahan || prevFormData.basic.kelurahan,
        kecamatan: kecamatan || prevFormData.basic.kecamatan,
        kabKota: kabKota || prevFormData.basic.kabKota,
        kodePos: kodePos || prevFormData.basic.kodePos,
        provinsi: provinsi || prevFormData.basic.provinsi,
      },
      members: newMembers,
      footer: {
        ...prevFormData.footer,
        issueDate: finalIssueDate,
        issueMonth: finalIssueMonth,
        issueYear: finalIssueYear,
        nip: nip || prevFormData.footer.nip,
        kepalaDinas: kadisName || prevFormData.footer.kepalaDinas
      }
    };

  } catch (error) {
    console.error(error);
    setOcrLoading(false);
    toast.error("Gagal membaca dokumen secara penuh.");
    return null;
  }
};
