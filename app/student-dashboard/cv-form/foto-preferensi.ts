const PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/** Gambar contoh untuk pratinjau / pengisian cepat foto 3×4 (bukan pengganti foto resmi peserta). */
export const FOTO_PREFERENSI = [
  {
    id: 'contoh_pria',
    label: 'Contoh pria (kemeja putih, dasi hitam)',
    shortLabel: 'Pria',
    src: PLACEHOLDER,
    filename: 'contoh_pria.png',
  },
  {
    id: 'contoh_kerudung',
    label: 'Contoh kerudung (kemeja putih, dasi hitam)',
    shortLabel: 'Kerudung',
    src: PLACEHOLDER,
    filename: 'contoh_kerudung.png',
  },
] as const;

export type FotoPreferensiId = (typeof FOTO_PREFERENSI)[number]['id'];

/**
 * Muat aset statis ke File + data URL agar sama alurnya dengan upload manual (termasuk kirim ke backend).
 */
export async function applyFotoPreferensi(
  imageSrc: string,
  filename: string,
  setDataUrl: (dataUrl: string) => void,
  onFotoFileChange?: (file: File | null) => void,
): Promise<void> {
  const res = await fetch(imageSrc);
  if (!res.ok) {
    throw new Error('Gagal memuat gambar contoh');
  }
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || 'image/png' });
  onFotoFileChange?.(file);

  await new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      setDataUrl(reader.result as string);
      resolve();
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
