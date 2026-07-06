'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from './FormControls';
import type { AnggotaKeluarga } from '../types';
import { HUBUNGAN_OPTIONS } from '@/lib/cv-hubungan';
interface Props {
  items: AnggotaKeluarga[];
  onChange: (items: AnggotaKeluarga[]) => void;
  errors?: Record<string, string>;
}

const PEKERJAAN_OPTIONS = [
  { value: '学生', label: '学生 / Pelajar/Mahasiswa' },
  { value: '会社員', label: '会社員 / Karyawan' },
  { value: '主婦', label: '主婦 / Ibu Rumah Tangga' },
  { value: '商人', label: '商人 / Pemilik Toko' },
  { value: '農家', label: '農家 / Petani' },
  { value: '家畜', label: '家畜 / Ternak' },
  { value: '政府職員', label: '政府職員 / Pegawai Negeri Sipil' },
  { value: '事業主', label: '事業主 / Pemilik Usaha Keluarga' },
  { value: '会社のマネージャー', label: '会社のマネージャー / Manajer di Perusahaan' },
  { value: '無職', label: '無職 / Tidak Bekerja' },
];

const emptyItem = (): AnggotaKeluarga => ({
  id: crypto.randomUUID(),
  hubungan: '',
  nama_anggota: '',
  umur: '',
  pekerjaan: '',
});

export default function StepKeluarga({ items, onChange, errors = {} }: Props) {
  const [manualPekerjaanMap, setManualPekerjaanMap] = useState<Record<string, boolean>>({});

  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof AnggotaKeluarga, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  const isUnlistedPekerjaan = (pekerjaan: string) => {
    if (!pekerjaan) return false;
    return !PEKERJAAN_OPTIONS.some(o => o.value === pekerjaan);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">家族構成を追加してください。</p>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition">
          <Plus size={16} /> Tambah
        </button>
      </div>
      {items.length === 0 && (
        <div
          id="field-keluarga-empty"
          className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl"
        >
          家族データなし / Belum ada data keluarga
        </div>
      )}
      {items.map((item, idx) => (
        <div key={item.id} id={`keluarga-${item.id}`} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600">家族 #{idx + 1}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect
              id={`field-keluarga-hubungan-${item.id}`}
              label="続柄 / Hubungan"
              value={item.hubungan}
              onChange={(v) => update(item.id, 'hubungan', v)}
              options={HUBUNGAN_OPTIONS}
              required
              error={errors[`keluarga-${item.id}-hubungan`]}
            />
            <FormField
              id={`field-keluarga-nama-${item.id}`}
              label="氏名 / Nama"
              value={item.nama_anggota}
              onChange={(v) => update(item.id, 'nama_anggota', v)}
              placeholder="Nama lengkap (Katakana)"
              required
              error={errors[`keluarga-${item.id}-nama_anggota`]}
            />
            <FormField
              id={`field-keluarga-umur-${item.id}`}
              label="年齢 / Umur (tahun)"
              value={item.umur ?? ''}
              onChange={(v) => update(item.id, 'umur', v)}
              type="number"
              placeholder="Contoh: 55"
              required
              error={errors[`keluarga-${item.id}-umur`]}
            />
            {(() => {
              const selectOptions = [...PEKERJAAN_OPTIONS, { value: 'Other', label: 'Lainnya (Isi Manual)' }];
              const isCustom = manualPekerjaanMap[item.id] || isUnlistedPekerjaan(item.pekerjaan);

              return (
                <>
                  <FormSelect
                    id={`field-keluarga-pekerjaan-select-${item.id}`}
                    label="職業 / Pekerjaan"
                    value={isCustom ? 'Other' : item.pekerjaan}
                    onChange={(v) => {
                      if (v === 'Other') {
                        setManualPekerjaanMap(prev => ({ ...prev, [item.id]: true }));
                        update(item.id, 'pekerjaan', '');
                      } else {
                        setManualPekerjaanMap(prev => ({ ...prev, [item.id]: false }));
                        update(item.id, 'pekerjaan', v);
                      }
                    }}
                    options={selectOptions}
                    required={!isCustom}
                    error={!isCustom ? errors[`keluarga-${item.id}-pekerjaan`] : undefined}
                  />
                  {isCustom && (
                    <FormField
                      id={`field-keluarga-pekerjaan-${item.id}`}
                      label="Pekerjaan (Manual)"
                      value={item.pekerjaan}
                      onChange={(v) => update(item.id, 'pekerjaan', v)}
                      placeholder="Contoh: Pedagang"
                      required
                      error={errors[`keluarga-${item.id}-pekerjaan`]}
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}
