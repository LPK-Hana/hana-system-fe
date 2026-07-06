'use client';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from '../ui/FormControls';
import type { AnggotaKeluarga } from '@/types/cv.types';
import { HUBUNGAN_OPTIONS } from '@/lib/cv-hubungan';

interface Props {
  items: AnggotaKeluarga[];
  onChange: (items: AnggotaKeluarga[]) => void;
}

const emptyItem = (): AnggotaKeluarga => ({
  id: crypto.randomUUID(),
  hubungan: '',
  nama_anggota: '',
  umur: '',
  pekerjaan: '',
});

export default function StepKeluarga({ items, onChange }: Props) {
  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof AnggotaKeluarga, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Tambahkan data anggota keluarga inti.</p>
        <button
          onClick={add}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Belum ada data keluarga
        </div>
      )}

      {items.map((item, idx) => (
        <div key={item.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600">Anggota #{idx + 1}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect label="Hubungan" value={item.hubungan} onChange={(v) => update(item.id, 'hubungan', v)} options={HUBUNGAN_OPTIONS} required />
            <FormField label="Nama" value={item.nama_anggota} onChange={(v) => update(item.id, 'nama_anggota', v)} placeholder="Nama lengkap" required />
            <FormField label="Umur (tahun)" type="number" value={item.umur ?? ''} onChange={(v) => update(item.id, 'umur', v)} placeholder="Contoh: 45" required />
            <FormField label="Pekerjaan" value={item.pekerjaan} onChange={(v) => update(item.id, 'pekerjaan', v)} placeholder="Contoh: Pedagang" />
          </div>
        </div>
      ))}
    </div>
  );
}
