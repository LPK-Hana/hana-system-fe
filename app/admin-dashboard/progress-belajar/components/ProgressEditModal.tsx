'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ProgressRow, AspectKey, aspectsConfig } from '../data';
import { NilaiSaveScope } from '@/lib/nilai-revision';
import { toast } from 'react-hot-toast';

export default function ProgressEditModal({
  draft,
  activeAspect: initialAspect,
  onClose,
  onSave,
  onFieldChange,
}: {
  draft: ProgressRow | null;
  activeAspect: AspectKey;
  onClose: () => void;
  onSave: (dirtyScopes: NilaiSaveScope[]) => Promise<void>;
  onFieldChange: (field: string, value: any, aspect?: AspectKey) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [localAspect, setLocalAspect] = useState<AspectKey>(initialAspect);
  const [isSaving, setIsSaving] = useState(false);
  const [dirtyScopes, setDirtyScopes] = useState<Set<NilaiSaveScope>>(new Set());

  const markDirty = (scope: NilaiSaveScope) => {
    setDirtyScopes((prev) => {
      const next = new Set(prev);
      next.add(scope);
      return next;
    });
  };

  const handleFieldChange = (field: string, value: any, aspect?: AspectKey) => {
    if (field === 'ujian_masuk' || field === 'ujian_n5_score' || field === 'ujian_n4_score' || field === 'keterangan') {
      markDirty('exams');
    } else if (aspect === 'kepribadian') {
      markDirty('kepribadian');
    } else if (aspect) {
      markDirty(aspect);
    }
    onFieldChange(field, value, aspect);
  };

  const handleSave = async () => {
    if (dirtyScopes.size === 0) {
      toast.error('Tidak ada perubahan untuk disimpan.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(Array.from(dirtyScopes));
      setDirtyScopes(new Set());
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setLocalAspect(initialAspect);
    setDirtyScopes(new Set());
  }, [draft?.no_peserta, initialAspect]);
  if (!mounted || !draft) return null;

  const currentConfig = aspectsConfig[localAspect];
  const aspectScores = draft[localAspect];

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white border border-gray-200 shadow-2xl flex flex-col">
        {isSaving && <LoadingOverlay text="MEMPROSES..." />}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Edit Progress Belajar</h2>
            <p className="text-xs text-gray-500 mt-1">{draft.nama_lengkap} ({draft.no_peserta})</p>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          <section>
            <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-4">Informasi Umum</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="No Peserta" value={draft.no_peserta} onChange={(v) => handleFieldChange('no_peserta', v)} readOnly />
              <Input label="Nama Lengkap" value={draft.nama_lengkap} onChange={(v) => handleFieldChange('nama_lengkap', v)} readOnly />
            </div>
          </section>

          <section>
            <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-4">Nilai Ujian Utama</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Input label="Ujian Masuk" value={String(draft.ujian_masuk) === '-' ? '' : String(draft.ujian_masuk)} onChange={(v) => handleFieldChange('ujian_masuk', v)} placeholder='Kosongkan jika belum ada' type="number" />
              <Input label="Ujian N5" value={String(draft.ujian_n5_score) === '-' ? '' : String(draft.ujian_n5_score)} onChange={(v) => handleFieldChange('ujian_n5_score', v)} placeholder='Kosongkan jika belum ada' type="number" />
              <Input label="Ujian N4" value={String(draft.ujian_n4_score) === '-' ? '' : String(draft.ujian_n4_score)} onChange={(v) => handleFieldChange('ujian_n4_score', v)} placeholder='Kosongkan jika belum ada' type="number" />
            </div>

            <div className="block w-full bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
              <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Progress (%)</span>
              <div className="mt-4">
                <ProgressBar percentage={Number(draft.progress_percentages?.[localAspect] || 0)} />
              </div>
            </div>

            <div className="block w-full mb-2">
              <TextArea
                label="Catatan Sikap Siswa"
                value={draft.keterangan !== '-' ? draft.keterangan : ''}
                placeholder="Masukan catatan tentang sikap atau perilaku siswa"
                onChange={(v) => handleFieldChange('keterangan', v)}
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-4">Nilai Materi</h3>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <label htmlFor="aspect-select" className="block text-xs font-semibold tracking-wide text-gray-600 uppercase mb-2">
                  Pilih Aspek Penilaian:
                </label>
                <div className="relative">
                  <select
                    id="aspect-select"
                    value={localAspect}
                    onChange={(e) => setLocalAspect(e.target.value as AspectKey)}
                    className="w-full appearance-none bg-white border border-gray-300 text-gray-800 py-2.5 pl-4 pr-10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent rounded-lg shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    {(Object.keys(aspectsConfig) as AspectKey[]).map(key => (
                      <option key={key} value={key}>
                        {aspectsConfig[key].label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 border-l border-gray-200">
                    <ChevronDown size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                  <TextArea
                    label={`Keterangan Penilaian ${aspectsConfig[localAspect].label}`}
                    value={(draft.keterangans && draft.keterangans[localAspect] !== '-') ? draft.keterangans[localAspect] : ''}
                    placeholder="Kosongkan jika tidak ada"
                    onChange={(v) => {
                      const newKeterangans = { ...(draft.keterangans || {}) };
                      newKeterangans[localAspect] = v;
                      if (localAspect === 'kepribadian') {
                        handleFieldChange('keterangans', newKeterangans, 'kepribadian');
                      } else {
                        markDirty(localAspect as NilaiSaveScope);
                        onFieldChange('keterangans', newKeterangans);
                      }
                    }}
                  />
                </div>

                {localAspect === 'kepribadian' ? (
                  <>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 pb-2 border-b border-gray-100">Evaluasi Sikap & Perilaku (Sikap Siswa)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentConfig.columns.map((col) => (
                        <div key={col.key} className="bg-gray-50/50 p-4 border border-gray-200/80 rounded-xl flex flex-col justify-between">
                          <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase mb-2 truncate" title={col.label}>{col.label}</span>
                          <select
                            value={(function (v: any) {
                              let val = String(v ?? '-');
                              if (val === 'sangat_baik' || val.toLowerCase() === 'sangat baik') val = 'Sangat Baik';
                              else if (val === 'baik' || val.toLowerCase() === 'baik') val = 'Baik';
                              else if (val === 'cukup' || val.toLowerCase() === 'cukup') val = 'Cukup';
                              else if (val === 'kurang' || val.toLowerCase() === 'kurang') val = 'Kurang';
                              else if (val === 'sangat_kurang' || val.toLowerCase() === 'sangat kurang') val = 'Sangat Kurang';
                              return val;
                            })(aspectScores[col.key])}
                            onChange={(e) => handleFieldChange(col.key, e.target.value, localAspect)}
                            className="w-full border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg shadow-sm font-medium cursor-pointer"
                          >
                            <option value="-">Belum Dinilai (-)</option>
                            <option value="Sangat Baik">非常に良い (Sangat Baik)</option>
                            <option value="Baik">良い (Baik)</option>
                            <option value="Cukup">普通 (Cukup)</option>
                            <option value="Kurang">悪い (Kurang)</option>
                            <option value="Sangat Kurang">非常に悪い (Sangat Kurang)</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 pb-2 border-b border-gray-100">Daftar Nilai Bab</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px] tracking-wider w-1/3">Materi</th>
                              <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px] tracking-wider w-2/3 border-l border-gray-200">Nilai</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {currentConfig.columns.slice(0, Math.ceil(currentConfig.columns.length / 2)).map((col) => (
                              <tr key={col.key} className="hover:bg-emerald-50/30 transition-colors group focus-within:bg-emerald-50/30">
                                <td className="px-4 py-2 text-gray-700 font-medium whitespace-nowrap">{col.label}</td>
                                <td className="px-0 py-0 border-l border-gray-200">
                                  <input
                                    type="number"
                                    value={String(aspectScores[col.key] ?? '') === '-' ? '' : String(aspectScores[col.key] ?? '')}
                                    onChange={(e) => handleFieldChange(col.key, e.target.value, localAspect)}
                                    placeholder="-"
                                    className="w-full h-full border-0 bg-transparent py-2.5 px-4 focus:ring-inset focus:ring-2 focus:ring-emerald-600 outline-none transition-shadow text-gray-800 font-medium"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {currentConfig.columns.length > 1 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px] tracking-wider w-1/3">Materi</th>
                                <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-[10px] tracking-wider w-2/3 border-l border-gray-200">Nilai</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {currentConfig.columns.slice(Math.ceil(currentConfig.columns.length / 2)).map((col) => (
                                <tr key={col.key} className="hover:bg-emerald-50/30 transition-colors group focus-within:bg-emerald-50/30">
                                  <td className="px-4 py-2 text-gray-700 font-medium whitespace-nowrap">{col.label}</td>
                                  <td className="px-0 py-0 border-l border-gray-200">
                                    <input
                                      type="number"
                                      value={String(aspectScores[col.key] ?? '') === '-' ? '' : String(aspectScores[col.key] ?? '')}
                                      onChange={(e) => handleFieldChange(col.key, e.target.value, localAspect)}
                                      placeholder="-"
                                      className="w-full h-full border-0 bg-transparent py-2.5 px-4 focus:ring-inset focus:ring-2 focus:ring-emerald-600 outline-none transition-shadow text-gray-800 font-medium"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSaving} className="px-5 py-2.5 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Batal
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 transition-colors disabled:opacity-75 disabled:cursor-not-allowed">
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase truncate" title={label}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (!readOnly) onChange(e.target.value);
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`mt-2 w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'}`}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${percentage >= 80 ? 'bg-green-500' : percentage >= 40 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-sm font-semibold text-gray-700 w-10 text-right">{percentage}%</span>
    </div>
  );
}

