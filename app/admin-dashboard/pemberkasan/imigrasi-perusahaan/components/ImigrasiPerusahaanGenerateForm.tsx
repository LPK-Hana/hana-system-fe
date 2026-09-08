'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Eye, FileText, Plus, Save, Sparkles, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ApiFormDraft from '@/app/api/form-draft/api_form_draft';
import {
  emptyPeserta,
  MAX_PESERTA,
  type ImigrasiPerusahaanFormData,
  type PesertaRow,
} from '../lib/fillImigrasiPerusahaanDocx';

const emptyForm: ImigrasiPerusahaanFormData = {
  buatThn: '',
  buatBln: '',
  buatTgl: '',
  namaPerusahaanJp: '',
  namaPerusahaanId: '',
  namaKumiaiJp: '',
  namaKumiaiId: '',
  peserta: [emptyPeserta()],
  tglBrgktThn: '',
  tglBrgktBln: '',
  tglBrgktTgl: '',
  shokushuJp: '',
  namaPTPendamping: '',
  namaDirekturPT: '',
  namaRijicho: '',
  tglMskDiklatThn: '',
  tglMskDiklatBln: '',
  tglMskDiklatTgl: '',
  tglKlrDiklatThn: '',
  tglKlrDiklatBln: '',
  tglKlrDiklatTgl: '',
};

const dummyForm: ImigrasiPerusahaanFormData = {
  buatThn: '2026',
  buatBln: '7',
  buatTgl: '15',
  namaPerusahaanJp: '株式会社ダミーフーズ',
  namaPerusahaanId: 'DUMMY FOODS CO., LTD.',
  namaKumiaiJp: 'ダミー事業協同組合',
  namaKumiaiId: 'DUMMY COOPERATIVE',
  peserta: [
    { nama: 'BUDI SANTOSO PRATAMA', lahirThn: '2003', lahirBln: '8', lahirTgl: '20', gender: 'Laki-laki' },
    { nama: 'SITI AMINAH', lahirThn: '2004', lahirBln: '3', lahirTgl: '12', gender: 'Perempuan' },
    { nama: 'AHMAD FAIZAL', lahirThn: '2002', lahirBln: '11', lahirTgl: '5', gender: 'Laki-laki' },
    { nama: 'DEWI LESTARI', lahirThn: '2005', lahirBln: '1', lahirTgl: '28', gender: 'Perempuan' },
    { nama: 'RIZKY MAULANA', lahirThn: '2003', lahirBln: '6', lahirTgl: '14', gender: 'Laki-laki' },
    { nama: 'NURUL HIDAYAH', lahirThn: '2004', lahirBln: '9', lahirTgl: '3', gender: 'Perempuan' },
    { nama: 'ANDI WIJAYA', lahirThn: '2001', lahirBln: '4', lahirTgl: '17', gender: 'Laki-laki' },
    { nama: 'FITRI RAHMAWATI', lahirThn: '2005', lahirBln: '7', lahirTgl: '22', gender: 'Perempuan' },
    { nama: 'DIMAS ANGGARA', lahirThn: '2002', lahirBln: '12', lahirTgl: '9', gender: 'Laki-laki' },
    { nama: 'AYU PERMATA SARI', lahirThn: '2004', lahirBln: '2', lahirTgl: '25', gender: 'Perempuan' },
  ],
  tglBrgktThn: '2026',
  tglBrgktBln: '9',
  tglBrgktTgl: '10',
  shokushuJp: '牛豚食肉処理加工業',
  namaPTPendamping: 'LPK RAFTEL SATYA INDONESIA',
  namaDirekturPT: 'MUHAMAD KAMIL MAULUDIN',
  namaRijicho: '山田太郎',
  tglMskDiklatThn: '2026',
  tglMskDiklatBln: '7',
  tglMskDiklatTgl: '20',
  tglKlrDiklatThn: '2026',
  tglKlrDiklatBln: '8',
  tglKlrDiklatTgl: '20',
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-raftel-500 focus:ring-2 focus:ring-raftel-100';

const inputCompactCls =
  'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-raftel-500 focus:ring-2 focus:ring-raftel-100';

export default function ImigrasiPerusahaanGenerateForm() {
  const router = useRouter();
  const [form, setForm] = useState<ImigrasiPerusahaanFormData>(emptyForm);
  const [busy, setBusy] = useState<'docx' | 'preview' | 'pdf' | 'save' | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    blob: Blob;
    filename: string;
  } | null>(null);

  const set = <K extends keyof ImigrasiPerusahaanFormData>(
    key: K,
    value: ImigrasiPerusahaanFormData[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updatePeserta = (idx: number, patch: Partial<PesertaRow>) => {
    setForm((f) => ({
      ...f,
      peserta: f.peserta.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));
  };

  const payload = useMemo(() => form, [form]);

  useEffect(() => {
    void ApiFormDraft().getImigrasi().then((res) => {
      if (res?.status === 200 && res.data && typeof res.data === 'object') {
        setForm((f) => ({ ...f, ...(res.data as ImigrasiPerusahaanFormData) }));
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    };
  }, [pdfPreview?.url]);

  function closePdfPreview() {
    if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    setPdfPreview(null);
  }

  function triggerBlobDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveDraft() {
    setBusy('save');
    try {
      const res = await ApiFormDraft().saveImigrasi({ payload: form });
      if (res?.status === 200) toast.success('Draft imigrasi tersimpan di database');
      else toast.error(res?.message || 'Gagal menyimpan draft');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function downloadDocx() {
    setBusy('docx');
    try {
      const res = await fetch('/api/pemberkasan/imigrasi-perusahaan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'docx', data: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Gagal generate');
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename=\"([^\"]+)\"/);
      const filename = match?.[1] || 'Dokumen_Imigrasi_Perusahaan.docx';
      triggerBlobDownload(blob, filename);
      toast.success('Berhasil unduh DOCX');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function openPdfPreview() {
    setBusy('preview');
    try {
      const res = await fetch('/api/pemberkasan/imigrasi-perusahaan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf', data: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Gagal generate PDF');
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename=\"([^\"]+)\"/);
      const filename = match?.[1] || 'Dokumen_Imigrasi_Perusahaan.pdf';
      if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
      setPdfPreview({ url: URL.createObjectURL(blob), blob, filename });
      toast.success('Preview PDF siap');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  function downloadPdfFromPreview() {
    if (!pdfPreview) return;
    setBusy('pdf');
    try {
      triggerBlobDownload(pdfPreview.blob, pdfPreview.filename);
      toast.success('Berhasil unduh PDF');
      closePdfPreview();
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F9FC] text-gray-800 relative overflow-hidden">
      <div className="raftel-wagara raftel-wagara-subtle" aria-hidden />
      <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push('/admin-dashboard/pemberkasan')}
              className="flex items-center gap-2 text-raftel-800 hover:text-raftel-950 font-medium shrink-0"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-serif text-raftel-900 truncate">
                Dokumen Imigrasi Perusahaan — Isi & Unduh
              </h1>
              <p className="text-xs text-slate-500">
                Template:{' '}
                <code className="text-[11px]">Dokumen_Imigrasi_Perusahaan(kosong).docx</code> — cukup
                timpa file itu jika Word berubah.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void saveDraft()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              <Save size={16} />
              {busy === 'save' ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => downloadDocx()}
              className="inline-flex items-center gap-2 rounded-lg bg-raftel-700 hover:bg-raftel-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              <FileText size={16} />
              {busy === 'docx' ? 'Menyiapkan…' : 'Unduh DOCX'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => openPdfPreview()}
              className="inline-flex items-center gap-2 rounded-lg border border-raftel-700 text-raftel-800 hover:bg-raftel-50 px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              <Eye size={16} />
              {busy === 'preview' ? 'Menyiapkan preview…' : 'Preview PDF'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => {
                setForm({ ...dummyForm, peserta: dummyForm.peserta.map((p) => ({ ...p })) });
                toast.success('Dummy terisi');
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500 text-amber-800 hover:bg-amber-50 px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              <Sparkles size={16} />
              Isi dummy
            </button>
          </div>
        </header>

        {pdfPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 md:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Preview PDF"
          >
            <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-raftel-900 truncate">Preview PDF</p>
                  <p className="text-xs text-slate-500 truncate">{pdfPreview.filename}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => downloadPdfFromPreview()}
                    className="inline-flex items-center gap-2 rounded-lg bg-raftel-700 hover:bg-raftel-800 text-white px-3 py-2 text-sm font-medium disabled:opacity-60"
                  >
                    <Download size={16} />
                    {busy === 'pdf' ? 'Mengunduh…' : 'Unduh PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => closePdfPreview()}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 text-sm font-medium"
                  >
                    <X size={16} />
                    Tutup
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 bg-slate-100">
                <iframe
                  title="Preview PDF Imigrasi Perusahaan"
                  src={pdfPreview.url}
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-raftel-900 mb-3">Tanggal dibuat</h2>
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              <Field label="Thn.">
                <input className={inputCompactCls} value={form.buatThn} onChange={(e) => set('buatThn', e.target.value)} />
              </Field>
              <Field label="Bln.">
                <input className={inputCompactCls} value={form.buatBln} onChange={(e) => set('buatBln', e.target.value)} />
              </Field>
              <Field label="Tgl.">
                <input className={inputCompactCls} value={form.buatTgl} onChange={(e) => set('buatTgl', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-raftel-900 mb-3">Perusahaan & kumiai</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nama perusahaan (JP)">
                <input className={inputCls} value={form.namaPerusahaanJp} onChange={(e) => set('namaPerusahaanJp', e.target.value)} />
              </Field>
              <Field label="Nama perusahaan (ID)">
                <input className={inputCls} value={form.namaPerusahaanId} onChange={(e) => set('namaPerusahaanId', e.target.value)} />
              </Field>
              <Field label="Nama kumiai (JP)">
                <input className={inputCls} value={form.namaKumiaiJp} onChange={(e) => set('namaKumiaiJp', e.target.value)} />
              </Field>
              <Field label="Nama kumiai (ID)">
                <input className={inputCls} value={form.namaKumiaiId} onChange={(e) => set('namaKumiaiId', e.target.value)} />
              </Field>
              <Field label="Nama rijicho / ketua kumiai">
                <input className={inputCls} value={form.namaRijicho} onChange={(e) => set('namaRijicho', e.target.value)} />
              </Field>
              <Field label="Shokushu (JP)">
                <input className={inputCls} value={form.shokushuJp} onChange={(e) => set('shokushuJp', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-semibold text-raftel-900">
                Peserta (maks. {MAX_PESERTA})
              </h2>
              <button
                type="button"
                disabled={form.peserta.length >= MAX_PESERTA}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    peserta: [...f.peserta, emptyPeserta()],
                  }))
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-raftel-600 text-raftel-800 px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="space-y-4">
              {form.peserta.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Peserta {idx + 1}
                    </span>
                    {form.peserta.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            peserta: f.peserta.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-rose-600 hover:text-rose-800 p-1"
                        aria-label="Hapus peserta"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nama peserta">
                      <input
                        className={inputCls}
                        value={row.nama}
                        onChange={(e) => updatePeserta(idx, { nama: e.target.value })}
                      />
                    </Field>
                    <Field label="Jenis kelamin">
                      <select
                        className={inputCls}
                        value={row.gender}
                        onChange={(e) =>
                          updatePeserta(idx, {
                            gender: e.target.value as PesertaRow['gender'],
                          })
                        }
                      >
                        <option value="Laki-laki">Laki-laki (男)</option>
                        <option value="Perempuan">Perempuan (女)</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-w-sm">
                    <Field label="Lahir Thn.">
                      <input
                        className={inputCompactCls}
                        value={row.lahirThn}
                        onChange={(e) => updatePeserta(idx, { lahirThn: e.target.value })}
                      />
                    </Field>
                    <Field label="Bln.">
                      <input
                        className={inputCompactCls}
                        value={row.lahirBln}
                        onChange={(e) => updatePeserta(idx, { lahirBln: e.target.value })}
                      />
                    </Field>
                    <Field label="Tgl.">
                      <input
                        className={inputCompactCls}
                        value={row.lahirTgl}
                        onChange={(e) => updatePeserta(idx, { lahirTgl: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-raftel-900 mb-3">Keberangkatan & diklat</h2>
            <p className="text-xs text-slate-500 mb-3">
              Tanggal masuk diklat +1…+31 otomatis diisi ke jadwal di Word. Tanggal berangkat
              dipakai untuk semua peserta yang terisi.
            </p>
            <div className="grid grid-cols-3 gap-2 max-w-sm mb-3">
              <Field label="Berangkat Thn.">
                <input className={inputCompactCls} value={form.tglBrgktThn} onChange={(e) => set('tglBrgktThn', e.target.value)} />
              </Field>
              <Field label="Bln.">
                <input className={inputCompactCls} value={form.tglBrgktBln} onChange={(e) => set('tglBrgktBln', e.target.value)} />
              </Field>
              <Field label="Tgl.">
                <input className={inputCompactCls} value={form.tglBrgktTgl} onChange={(e) => set('tglBrgktTgl', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-sm mb-3">
              <Field label="Masuk diklat Thn.">
                <input className={inputCompactCls} value={form.tglMskDiklatThn} onChange={(e) => set('tglMskDiklatThn', e.target.value)} />
              </Field>
              <Field label="Bln.">
                <input className={inputCompactCls} value={form.tglMskDiklatBln} onChange={(e) => set('tglMskDiklatBln', e.target.value)} />
              </Field>
              <Field label="Tgl.">
                <input className={inputCompactCls} value={form.tglMskDiklatTgl} onChange={(e) => set('tglMskDiklatTgl', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              <Field label="Keluar diklat Thn.">
                <input className={inputCompactCls} value={form.tglKlrDiklatThn} onChange={(e) => set('tglKlrDiklatThn', e.target.value)} />
              </Field>
              <Field label="Bln.">
                <input className={inputCompactCls} value={form.tglKlrDiklatBln} onChange={(e) => set('tglKlrDiklatBln', e.target.value)} />
              </Field>
              <Field label="Tgl.">
                <input className={inputCompactCls} value={form.tglKlrDiklatTgl} onChange={(e) => set('tglKlrDiklatTgl', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-raftel-900 mb-3">Lembaga pendamping</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nama PT / LPK pendamping">
                <input className={inputCls} value={form.namaPTPendamping} onChange={(e) => set('namaPTPendamping', e.target.value)} />
              </Field>
              <Field label="Nama direktur PT / LPK">
                <input className={inputCls} value={form.namaDirekturPT} onChange={(e) => set('namaDirekturPT', e.target.value)} />
              </Field>
            </div>
          </section>

          <p className="text-xs text-slate-500 px-1">
            PDF memakai Microsoft Word di server (COM). Jika gagal, unduh DOCX lalu &quot;Save as PDF&quot; di
            Word.
          </p>
        </div>
      </div>
    </main>
  );
}
