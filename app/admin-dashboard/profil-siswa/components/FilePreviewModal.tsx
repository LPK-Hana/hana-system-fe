'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Loader2, FileWarning } from 'lucide-react';
import { getAuthToken } from '@/lib/auth';

interface FilePreviewModalProps {
  title: string;
  filename: string;
  url: string;
  onClose: () => void;
}

function isPdfFile(filename: string): boolean {
  return /\.pdf$/i.test(filename);
}

function isImageFile(filename: string): boolean {
  return /\.(webp|jpe?g|png|gif)$/i.test(filename);
}

export default function FilePreviewModal({ title, filename, url, onClose }: FilePreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const res = await fetch(url, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          throw new Error(`File tidak ditemukan atau akses ditolak (${res.status})`);
        }
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Gagal memuat file');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/55 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white border border-gray-200 shadow-2xl flex flex-col rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg font-serif text-gray-900 truncate">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{filename}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-sm"
              >
                <Download size={14} /> Download
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-slate-100 flex items-center justify-center p-4 overflow-auto">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-sm">Memuat file...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 text-center max-w-md px-4">
              <FileWarning className="text-amber-500" size={40} />
              <p className="text-sm text-gray-700">{error}</p>
              <p className="text-xs text-gray-500">Pastikan file ada di server dan Anda masih login sebagai admin.</p>
            </div>
          )}

          {!loading && !error && blobUrl && isPdfFile(filename) && (
            <iframe
              src={blobUrl}
              title={filename}
              className="w-full h-[70vh] bg-white border border-gray-200 rounded-sm"
            />
          )}

          {!loading && !error && blobUrl && isImageFile(filename) && (
            <img
              src={blobUrl}
              alt={filename}
              className="max-w-full max-h-[70vh] object-contain bg-white border border-gray-200 rounded-sm shadow-sm"
            />
          )}

          {!loading && !error && blobUrl && !isPdfFile(filename) && !isImageFile(filename) && (
            <div className="text-center text-sm text-gray-600">
              <p className="mb-3">Preview tidak tersedia untuk tipe file ini.</p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-sm"
              >
                <Download size={16} /> Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
