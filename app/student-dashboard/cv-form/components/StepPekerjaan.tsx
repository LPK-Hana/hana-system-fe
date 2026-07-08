'use client';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from './FormControls';
import type { RiwayatPekerjaan } from '../types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '../defaults';

interface Props {
  items: RiwayatPekerjaan[];
  onChange: (items: RiwayatPekerjaan[]) => void;
  errors?: Record<string, string>;
}

const STATUS_OPTIONS = [
  { value: 'Magang', label: '実習 / Magang' },
  { value: 'Karyawan Kontrak', label: '契約社員 / Karyawan Kontrak' },
  { value: 'Karyawan Tetap', label: '正社員 / Karyawan Tetap' },
];

const emptyItem = (): RiwayatPekerjaan => ({
  id: crypto.randomUUID(),
  tahun_mulai: '', bulan_mulai: '', tahun_selesai: '', bulan_selesai: '',
  nama_perusahaan: '', status_pekerjaan: '', posisi_pekerjaan: '',
});

export default function StepPekerjaan({ items, onChange, errors = {} }: Props) {
  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof RiwayatPekerjaan, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">職歴・実習経験を追加してください。<span className="text-slate-400"> (Opsional — boleh dikosongkan)</span></p>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition">
          <Plus size={16} /> Tambah
        </button>
      </div>
      {items.length === 0 && (
        <div
          id="field-pekerjaan-empty"
          className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl"
        >
          職歴データなし / Belum ada data pekerjaan
        </div>
      )}
      {items.map((item, idx) => (
        <div key={item.id} id={`pekerjaan-${item.id}`} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600">職歴 #{idx + 1}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id={`field-pekerjaan-nama-${item.id}`}
              label="会社名 / Nama Perusahaan"
              value={item.nama_perusahaan}
              onChange={(v) => update(item.id, 'nama_perusahaan', v)}
              placeholder="PT. Contoh Indonesia"
              error={errors[`pekerjaan-${item.id}-nama_perusahaan`]}
            />
            <FormSelect
              id={`field-pekerjaan-status-${item.id}`}
              label="雇用形態 / Status Pekerjaan"
              value={item.status_pekerjaan}
              onChange={(v) => update(item.id, 'status_pekerjaan', v)}
              options={STATUS_OPTIONS}
              error={errors[`pekerjaan-${item.id}-status_pekerjaan`]}
            />
            <FormField
              id={`field-pekerjaan-posisi-${item.id}`}
              label="役職 / Posisi / Jabatan"
              value={item.posisi_pekerjaan}
              onChange={(v) => update(item.id, 'posisi_pekerjaan', v)}
              placeholder="Contoh: Operator Produksi"
              className="sm:col-span-2"
              error={errors[`pekerjaan-${item.id}-posisi_pekerjaan`]}
            />
            <FormSelect
              id={`field-pekerjaan-bulan_mulai-${item.id}`}
              label="入社月 / Bulan Mulai"
              value={item.bulan_mulai}
              onChange={(v) => update(item.id, 'bulan_mulai', v)}
              options={BULAN_OPTIONS}
              error={errors[`pekerjaan-${item.id}-bulan_mulai`]}
            />
            <FormSelect
              id={`field-pekerjaan-tahun_mulai-${item.id}`}
              label="入社年 / Tahun Mulai"
              value={item.tahun_mulai}
              onChange={(v) => update(item.id, 'tahun_mulai', v)}
              options={TAHUN_OPTIONS}
              error={errors[`pekerjaan-${item.id}-tahun_mulai`]}
            />
            <FormSelect
              id={`field-pekerjaan-bulan_selesai-${item.id}`}
              label="退職月 / Bulan Selesai"
              value={item.bulan_selesai}
              onChange={(v) => update(item.id, 'bulan_selesai', v)}
              options={BULAN_OPTIONS}
              error={errors[`pekerjaan-${item.id}-bulan_selesai`]}
            />
            <FormSelect
              id={`field-pekerjaan-tahun_selesai-${item.id}`}
              label="退職年 / Tahun Selesai"
              value={item.tahun_selesai}
              onChange={(v) => update(item.id, 'tahun_selesai', v)}
              options={TAHUN_OPTIONS}
              error={errors[`pekerjaan-${item.id}-tahun_selesai`]}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
