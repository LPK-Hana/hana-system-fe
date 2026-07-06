'use client';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from '../ui/FormControls';
import type { Sertifikat } from '@/types/cv.types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '@/lib/cv-defaults';

interface Props {
  items: Sertifikat[];
  onChange: (items: Sertifikat[]) => void;
}

const STATUS_KELULUSAN_OPTIONS = [
  { value: '合格', label: 'Lulus (合格)' },
  { value: '不合格', label: 'Tidak Lulus (不合格)' },
];

const emptyItem = (): Sertifikat => ({
  id: crypto.randomUUID(),
  tahun_diperoleh: '', bulan_diperoleh: '',
  nama_sertifikat: '', status_kelulusan: '', keterangan_skor: '',
});

export default function StepSertifikat({ items, onChange }: Props) {
  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof Sertifikat, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Tambahkan sertifikat, lisensi, atau SIM yang dimiliki.</p>
        <button
          onClick={add}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Belum ada sertifikat / lisensi
        </div>
      )}

      {items.map((item, idx) => (
        <div key={item.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600">Sertifikat #{idx + 1}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nama Sertifikat / Lisensi"
              value={item.nama_sertifikat}
              onChange={(v) => update(item.id, 'nama_sertifikat', v)}
              placeholder="Contoh: JFT Basic A2, SIM A"
              required
              className="sm:col-span-2"
            />
            <FormSelect
              label="Status Kelulusan"
              value={item.status_kelulusan}
              onChange={(v) => update(item.id, 'status_kelulusan', v)}
              options={STATUS_KELULUSAN_OPTIONS}
              placeholder="Pilih status..."
            />
            <FormField
              label="Skor (opsional)"
              value={item.keterangan_skor}
              onChange={(v) => update(item.id, 'keterangan_skor', v)}
              placeholder="Contoh: 245 Poin"
            />
            <FormSelect label="Bulan Diperoleh" value={item.bulan_diperoleh} onChange={(v) => update(item.id, 'bulan_diperoleh', v)} options={BULAN_OPTIONS} />
            <FormSelect label="Tahun Diperoleh" value={item.tahun_diperoleh} onChange={(v) => update(item.id, 'tahun_diperoleh', v)} options={TAHUN_OPTIONS} />
          </div>
        </div>
      ))}
    </div>
  );
}

