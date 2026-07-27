'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Eye, FileText, Plus, Sparkles, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  calcUmur,
  MAX_KERJA,
  MAX_PENDIDIKAN,
  type JishuseiFormData,
  type KerjaRow,
  type PendidikanRow,
} from '../lib/fillJishuseiDocx';

const emptyPendidikan = (): PendidikanRow => ({
  mulaiThn: '',
  mulaiBln: '',
  selesaiThn: '',
  selesaiBln: '',
  namaSekolahJp: '',
  namaSekolahId: '',
});

const emptyKerja = (): KerjaRow => ({
  dariThn: '',
  dariBln: '',
  sampaiThn: '',
  sampaiBln: '',
  sampaiSekarang: false,
  namaPtJp: '',
  namaPtId: '',
  jenisKerjaJp: '',
  jenisKerjaId: '',
});

const emptyForm: JishuseiFormData = {
  buatThn: '',
  buatBln: '',
  buatTgl: '',
  namaLengkap: '',
  namaKatakana: '',
  gender: 'Laki-laki',
  lahirThn: '',
  lahirBln: '',
  lahirTgl: '',
  umur: '',
  alamat: '',
  pendidikan: [emptyPendidikan()],
  kerja: [emptyKerja()],
  shokushuJp: '',
  shokushuId: '',
  totalBulanKerja: '',
  namaPeserta: '',
  namaPerusahaanJp: '',
  namaPerusahaanId: '',
  namaKumiaiJp: '',
  namaKumiaiId: '',
};

const dummyForm: JishuseiFormData = {
  buatThn: '2026',
  buatBln: '7',
  buatTgl: '15',
  namaLengkap: 'BUDI SANTOSO PRATAMA',
  namaKatakana: 'ブディ・サントソ・プラタマ',
  gender: 'Laki-laki',
  lahirThn: '2003',
  lahirBln: '8',
  lahirTgl: '20',
  umur: calcUmur('2003', '8', '20', '2026', '7', '15'),
  alamat:
    'JL. MELATI NO. 12 RT/RW 001/002 DES. SUKAMAJU KEC. CIBINONG KAB. BOGOR JAWA BARAT 16911',
  pendidikan: [
    {
      mulaiThn: '2009',
      mulaiBln: '7',
      selesaiThn: '2015',
      selesaiBln: '6',
      namaSekolahJp: 'SDN SUKAMAJU 01',
      namaSekolahId: 'SDN SUKAMAJU 01',
    },
    {
      mulaiThn: '2015',
      mulaiBln: '7',
      selesaiThn: '2018',
      selesaiBln: '6',
      namaSekolahJp: 'SMPN 3 CIBINONG',
      namaSekolahId: 'SMPN 3 CIBINONG',
    },
    {
      mulaiThn: '2018',
      mulaiBln: '7',
      selesaiThn: '2021',
      selesaiBln: '5',
      namaSekolahJp: 'SMKN 2 BOGOR',
      namaSekolahId: 'SMKN 2 BOGOR',
    },
    {
      mulaiThn: '2021',
      mulaiBln: '9',
      selesaiThn: '2023',
      selesaiBln: '8',
      namaSekolahJp: 'LPK HANA TRAINING CENTER',
      namaSekolahId: 'LPK HANA TRAINING CENTER',
    },
  ],
  kerja: [
    {
      dariThn: '2021',
      dariBln: '6',
      sampaiThn: '2022',
      sampaiBln: '3',
      sampaiSekarang: false,
      namaPtJp: 'PT. NUSANTARA LOGISTIK',
      namaPtId: 'PT. NUSANTARA LOGISTIK',
      jenisKerjaJp: '倉庫作業',
      jenisKerjaId: 'gudang',
    },
    {
      dariThn: '2022',
      dariBln: '4',
      sampaiThn: '2023',
      sampaiBln: '2',
      sampaiSekarang: false,
      namaPtJp: 'CV. MAJU JAYA FOOD',
      namaPtId: 'CV. MAJU JAYA FOOD',
      jenisKerjaJp: '食品加工',
      jenisKerjaId: 'pengolahan makanan',
    },
    {
      dariThn: '2023',
      dariBln: '3',
      sampaiThn: '2024',
      sampaiBln: '1',
      sampaiSekarang: false,
      namaPtJp: 'PT. BINTANG PACKAGING',
      namaPtId: 'PT. BINTANG PACKAGING',
      jenisKerjaJp: '梱包',
      jenisKerjaId: 'packing',
    },
    {
      dariThn: '2024',
      dariBln: '2',
      sampaiThn: '2025',
      sampaiBln: '6',
      sampaiSekarang: false,
      namaPtJp: 'PT. HARAPAN METALINDO',
      namaPtId: 'PT. HARAPAN METALINDO',
      jenisKerjaJp: '金属加工',
      jenisKerjaId: 'pengolahan logam',
    },
    {
      dariThn: '2025',
      dariBln: '7',
      sampaiThn: '',
      sampaiBln: '',
      sampaiSekarang: true,
      namaPtJp: 'PT. SAMUDRA FRESH MEAT',
      namaPtId: 'PT. SAMUDRA FRESH MEAT',
      jenisKerjaJp: '食肉処理',
      jenisKerjaId: 'pengolahan daging',
    },
  ],
  shokushuJp: '牛豚食肉処理加工業',
  shokushuId: 'Pengolahan daging sapi dan babi',
  totalBulanKerja: '24',
  namaPeserta: 'BUDI SANTOSO PRATAMA',
  namaPerusahaanJp: '株式会社ダミーフーズ',
  namaPerusahaanId: 'DUMMY FOODS CO., LTD.',
  namaKumiaiJp: 'ダミー事業協同組合',
  namaKumiaiId: 'DUMMY COOPERATIVE',
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
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

const inputCompactCls =
  'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

export default function JishuseiGenerateForm() {
  const router = useRouter();
  const [form, setForm] = useState<JishuseiFormData>(emptyForm);
  const [busy, setBusy] = useState<'docx' | 'preview' | 'pdf' | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    blob: Blob;
    filename: string;
  } | null>(null);

  const set = <K extends keyof JishuseiFormData>(key: K, value: JishuseiFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  function syncUmur(
    patch: Partial<
      Pick<JishuseiFormData, 'lahirThn' | 'lahirBln' | 'lahirTgl' | 'buatThn' | 'buatBln' | 'buatTgl'>
    >,
  ) {
    setForm((f) => {
      const next = { ...f, ...patch };
      next.umur = calcUmur(
        next.lahirThn,
        next.lahirBln,
        next.lahirTgl,
        next.buatThn,
        next.buatBln,
        next.buatTgl,
      );
      return next;
    });
  }

  function updatePendidikan(index: number, patch: Partial<PendidikanRow>) {
    setForm((f) => {
      const pendidikan = f.pendidikan.map((row, i) => (i === index ? { ...row, ...patch } : row));
      return { ...f, pendidikan };
    });
  }

  function updateKerja(index: number, patch: Partial<KerjaRow>) {
    setForm((f) => {
      const kerja = f.kerja.map((row, i) => (i === index ? { ...row, ...patch } : row));
      return { ...f, kerja };
    });
  }

  const payload = useMemo(() => form, [form]);

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

  async function downloadDocx() {
    setBusy('docx');
    try {
      const res = await fetch('/api/pemberkasan/jishusei/generate', {
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
      const filename = match?.[1] || 'Dokumen_Jishusei.docx';
      triggerBlobDownload(blob, filename);
      toast.success('Berhasil unduh DOCX');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function openPdfPreview() {
    setBusy('preview');
    try {
      const res = await fetch('/api/pemberkasan/jishusei/generate', {
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
      const filename = match?.[1] || 'Dokumen_Jishusei.pdf';
      if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
      const url = URL.createObjectURL(blob);
      setPdfPreview({ url, blob, filename });
      toast.success('Preview PDF siap');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
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
    <main className="min-h-screen bg-[#F4F7F4] text-gray-800 relative overflow-hidden">
      <div className="hana-wagara hana-wagara-subtle" aria-hidden />
      <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push('/admin-dashboard/pemberkasan')}
              className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-medium shrink-0"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-serif text-emerald-900 truncate">
                Dokumen Jishusei — Isi & Unduh
              </h1>
              <p className="text-xs text-slate-500">
                Template: <code className="text-[11px]">Dokumen_Jishusei(kosong).docx</code> — cukup
                timpa file itu jika Word berubah (tanpa ubah kode).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!busy}
              onClick={() => downloadDocx()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              <FileText size={16} />
              {busy === 'docx' ? 'Menyiapkan…' : 'Unduh DOCX'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => openPdfPreview()}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 text-emerald-800 hover:bg-emerald-50 px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              <Eye size={16} />
              {busy === 'preview' ? 'Menyiapkan preview…' : 'Preview PDF'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => {
                setForm({ ...dummyForm, pendidikan: dummyForm.pendidikan.map((r) => ({ ...r })), kerja: dummyForm.kerja.map((r) => ({ ...r })) });
                toast.success('Dummy Budi Santoso terisi');
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
                  <p className="text-sm font-semibold text-emerald-900 truncate">Preview PDF</p>
                  <p className="text-xs text-slate-500 truncate">{pdfPreview.filename}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => downloadPdfFromPreview()}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 text-sm font-medium disabled:opacity-60"
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
                  title="Preview PDF Jishusei"
                  src={pdfPreview.url}
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <Download size={14} /> Tanggal dibuat & identitas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <Field label="Thn. dibuat">
                <input
                  className={inputCls}
                  value={form.buatThn}
                  onChange={(e) => syncUmur({ buatThn: e.target.value })}
                />
              </Field>
              <Field label="Bln. dibuat">
                <input
                  className={inputCls}
                  value={form.buatBln}
                  onChange={(e) => syncUmur({ buatBln: e.target.value })}
                />
              </Field>
              <Field label="Tgl. dibuat">
                <input
                  className={inputCls}
                  value={form.buatTgl}
                  onChange={(e) => syncUmur({ buatTgl: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nama lengkap (Romawi) → <namaLengkap>">
                <input
                  className={inputCls}
                  value={form.namaLengkap}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({ ...f, namaLengkap: v, namaPeserta: v }));
                  }}
                />
              </Field>
              <Field label="Nama Jepang / Katakana → <namaKatakana>">
                <input
                  className={inputCls}
                  value={form.namaKatakana}
                  onChange={(e) => set('namaKatakana', e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 max-w-sm">
              <Field label="Lahir Thn.">
                <input
                  className={inputCompactCls}
                  value={form.lahirThn}
                  onChange={(e) => syncUmur({ lahirThn: e.target.value })}
                />
              </Field>
              <Field label="Bln.">
                <input
                  className={inputCompactCls}
                  value={form.lahirBln}
                  onChange={(e) => syncUmur({ lahirBln: e.target.value })}
                />
              </Field>
              <Field label="Tgl.">
                <input
                  className={inputCompactCls}
                  value={form.lahirTgl}
                  onChange={(e) => syncUmur({ lahirTgl: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Jenis kelamin">
                <select
                  className={inputCls}
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value as JishuseiFormData['gender'])}
                >
                  <option value="Laki-laki">Laki-laki (男)</option>
                  <option value="Perempuan">Perempuan (女)</option>
                </select>
              </Field>
              <Field label="Umur (otomatis dari tgl. lahir)">
                <input className={inputCls + ' bg-slate-50'} value={form.umur} readOnly />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Alamat sekarang">
                <textarea
                  className={inputCls + ' min-h-[72px]'}
                  value={form.alamat}
                  onChange={(e) => set('alamat', e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-semibold text-emerald-900">
                ⑦ Pendidikan (maks. {MAX_PENDIDIKAN})
              </h2>
              <button
                type="button"
                disabled={form.pendidikan.length >= MAX_PENDIDIKAN}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    pendidikan: [...f.pendidikan, emptyPendidikan()],
                  }))
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 text-emerald-800 px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="space-y-4">
              {form.pendidikan.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Sekolah {idx + 1}</span>
                    {form.pendidikan.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            pendidikan: f.pendidikan.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-rose-600 hover:text-rose-800 p-1"
                        aria-label="Hapus sekolah"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Field label="Mulai Thn.">
                      <input
                        className={inputCls}
                        value={row.mulaiThn || ''}
                        onChange={(e) => updatePendidikan(idx, { mulaiThn: e.target.value })}
                      />
                    </Field>
                    <Field label="Bln.">
                      <input
                        className={inputCls}
                        value={row.mulaiBln || ''}
                        onChange={(e) => updatePendidikan(idx, { mulaiBln: e.target.value })}
                      />
                    </Field>
                    <Field label="Selesai Thn.">
                      <input
                        className={inputCls}
                        value={row.selesaiThn || ''}
                        onChange={(e) => updatePendidikan(idx, { selesaiThn: e.target.value })}
                      />
                    </Field>
                    <Field label="Bln.">
                      <input
                        className={inputCls}
                        value={row.selesaiBln || ''}
                        onChange={(e) => updatePendidikan(idx, { selesaiBln: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field label="Nama sekolah (JP)">
                      <input
                        className={inputCls}
                        value={row.namaSekolahJp || ''}
                        onChange={(e) => updatePendidikan(idx, { namaSekolahJp: e.target.value })}
                      />
                    </Field>
                    <Field label="Nama sekolah (ID)">
                      <input
                        className={inputCls}
                        value={row.namaSekolahId || ''}
                        onChange={(e) => updatePendidikan(idx, { namaSekolahId: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-semibold text-emerald-900">
                ⑧ Pengalaman kerja (maks. {MAX_KERJA})
              </h2>
              <button
                type="button"
                disabled={form.kerja.length >= MAX_KERJA}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    kerja: [...f.kerja, emptyKerja()],
                  }))
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 text-emerald-800 px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="space-y-4">
              {form.kerja.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Kerja {idx + 1}</span>
                    {form.kerja.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            kerja: f.kerja.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-rose-600 hover:text-rose-800 p-1"
                        aria-label="Hapus kerja"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Field label="Dari Thn.">
                      <input
                        className={inputCls}
                        value={row.dariThn || ''}
                        onChange={(e) => updateKerja(idx, { dariThn: e.target.value })}
                      />
                    </Field>
                    <Field label="Bln.">
                      <input
                        className={inputCls}
                        value={row.dariBln || ''}
                        onChange={(e) => updateKerja(idx, { dariBln: e.target.value })}
                      />
                    </Field>
                    <Field label="Sampai Thn.">
                      <input
                        className={inputCls}
                        value={row.sampaiThn || ''}
                        disabled={row.sampaiSekarang}
                        onChange={(e) => updateKerja(idx, { sampaiThn: e.target.value })}
                      />
                    </Field>
                    <Field label="Bln.">
                      <input
                        className={inputCls}
                        value={row.sampaiBln || ''}
                        disabled={row.sampaiSekarang}
                        onChange={(e) => updateKerja(idx, { sampaiBln: e.target.value })}
                      />
                    </Field>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={!!row.sampaiSekarang}
                      onChange={(e) => updateKerja(idx, { sampaiSekarang: e.target.checked })}
                    />
                    Sampai sekarang (現在まで)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field label="Nama perusahaan (JP)">
                      <input
                        className={inputCls}
                        value={row.namaPtJp || ''}
                        onChange={(e) => updateKerja(idx, { namaPtJp: e.target.value })}
                      />
                    </Field>
                    <Field label="Nama perusahaan (ID)">
                      <input
                        className={inputCls}
                        value={row.namaPtId || ''}
                        onChange={(e) => updateKerja(idx, { namaPtId: e.target.value })}
                      />
                    </Field>
                    <Field label="Jenis pekerjaan (JP)">
                      <input
                        className={inputCls}
                        value={row.jenisKerjaJp || ''}
                        onChange={(e) => updateKerja(idx, { jenisKerjaJp: e.target.value })}
                      />
                    </Field>
                    <Field label="Jenis pekerjaan (ID)">
                      <input
                        className={inputCls}
                        value={row.jenisKerjaId || ''}
                        onChange={(e) => updateKerja(idx, { jenisKerjaId: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-900 mb-3">
              ⑨ Pengalaman terkait keterampilan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Shokushu JP → <shokushuJp>">
                <input
                  className={inputCls}
                  value={form.shokushuJp || ''}
                  onChange={(e) => set('shokushuJp', e.target.value)}
                />
              </Field>
              <Field label="Shokushu ID → <shokushuId>">
                <input
                  className={inputCls}
                  value={form.shokushuId || ''}
                  onChange={(e) => set('shokushuId', e.target.value)}
                />
              </Field>
              <Field label="Lama (bulan) → ditulis 10ヶ月 / 10 bulan">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={form.totalBulanKerja || ''}
                  onChange={(e) => set('totalBulanKerja', e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-900 mb-1">
              Perincian Biaya — lembaga pelaksana & supervisi
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              ③ Nama lembaga pelaksana pemagangan teknis · ④ Nama lembaga supervisi
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="③ Perusahaan / lembaga JP → <namaPerusahaanJp>">
                <input
                  className={inputCls}
                  value={form.namaPerusahaanJp || ''}
                  onChange={(e) => set('namaPerusahaanJp', e.target.value)}
                />
              </Field>
              <Field label="③ Perusahaan / lembaga ID → <namaPerusahaanId>">
                <input
                  className={inputCls}
                  value={form.namaPerusahaanId || ''}
                  onChange={(e) => set('namaPerusahaanId', e.target.value)}
                />
              </Field>
              <Field label="④ Kumiai / supervisi JP → <namaKumiaiJp>">
                <input
                  className={inputCls}
                  value={form.namaKumiaiJp || ''}
                  onChange={(e) => set('namaKumiaiJp', e.target.value)}
                />
              </Field>
              <Field label="④ Kumiai / supervisi ID → <namaKumiaiId>">
                <input
                  className={inputCls}
                  value={form.namaKumiaiId || ''}
                  onChange={(e) => set('namaKumiaiId', e.target.value)}
                />
              </Field>
            </div>
          </section>

          <p className="text-xs text-slate-500 px-1">
            PDF memakai Microsoft Word di server (COM). Jika gagal, unduh DOCX lalu &quot;Save as PDF&quot; di
            Word — hasilnya 1:1.
          </p>
        </div>
      </div>
    </main>
  );
}
