import { useCallback, useEffect, useRef, useState } from 'react';

/** Simpan object URL gambar KK yang di-upload (untuk panel referensi di preview). */
export function useKkSourceImage() {
  const urlRef = useRef<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const setSourceFile = useCallback((file: File | null) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    fileRef.current = file;
    if (file) {
      urlRef.current = URL.createObjectURL(file);
      setSourceUrl(urlRef.current);
      setFileName(file.name);
    } else {
      setSourceUrl(null);
      setFileName('');
    }
  }, []);

  const setRemoteSource = useCallback((url: string, name: string) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    fileRef.current = null;
    setSourceUrl(url);
    setFileName(name);
  }, []);

  const clearSource = useCallback(() => setSourceFile(null), [setSourceFile]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return { sourceUrl, fileName, sourceFile: fileRef, setSourceFile, setRemoteSource, clearSource };
}
