import { useCallback, useEffect, useRef, useState } from 'react';

/** Simpan object URL gambar KK yang di-upload (untuk panel referensi di preview). */
export function useKkSourceImage() {
  const urlRef = useRef<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const setSourceFile = useCallback((file: File | null) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (file) {
      urlRef.current = URL.createObjectURL(file);
      setSourceUrl(urlRef.current);
      setFileName(file.name);
    } else {
      setSourceUrl(null);
      setFileName('');
    }
  }, []);

  const clearSource = useCallback(() => setSourceFile(null), [setSourceFile]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return { sourceUrl, fileName, setSourceFile, clearSource };
}
