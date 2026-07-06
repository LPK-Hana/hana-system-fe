'use client';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from '../ui/FormControls';
import type { RiwayatPekerjaan } from '@/types/cv.types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '@/lib/cv-defaults';

interface Props {
  items: RiwayatPekerjaan[];
  onChange: (items: RiwayatPekerjaan[]) => void;
}

const STATUS_OPTIONS = [
  { value: 'Magang', label: 'Magang (実習)' },
  { value: 'Karyawan Kontrak', label: 'Karyawan Kontrak (契約社員)' },
  { value: 'Karyawan Tetap', label: 'Karyawan Tetap (正社員)' },
];

const emptyItem = (): RiwayatPekerjaan => ({
  id: crypto.randomUUID(),
  tahun_mulai: '', bulan_mulai: '', tahun_selesai: '', bulan_selesai: '',
  nama_perusahaan: '', status_pekerjaan: '', posisi_pekerjaan: '',
});

export default function StepPekerjaan({ items, onChange }: Props) {
  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof RiwayatPekerjaan, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Tambahkan riwayat pekerjaan dan magang.</p>
        <button
          onClick={add}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Belum ada data pekerjaan
        </div>
      )}

      {items.map((item, idx) => (
        <div key={item.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600">Pekerjaan #{idx + 1}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Perusahaan" value={item.nama_perusahaan} onChange={(v) => update(item.id, 'nama_perusahaan', v)} placeholder="PT. Contoh Indonesia" required />
            <FormSelect label="Status Pekerjaan" value={item.status_pekerjaan} onChange={(v) => update(item.id, 'status_pekerjaan', v)} options={STATUS_OPTIONS} required />
            <FormField label="Posisi / Jabatan" value={item.posisi_pekerjaan} onChange={(v) => update(item.id, 'posisi_pekerjaan', v)} placeholder="Contoh: Operator Produksi" className="sm:col-span-2" />
            <FormSelect label="Bulan Mulai" value={item.bulan_mulai} onChange={(v) => update(item.id, 'bulan_mulai', v)} options={BULAN_OPTIONS} />
            <FormSelect label="Tahun Mulai" value={item.tahun_mulai} onChange={(v) => update(item.id, 'tahun_mulai', v)} options={TAHUN_OPTIONS} />
            <FormSelect label="Bulan Selesai" value={item.bulan_selesai} onChange={(v) => update(item.id, 'bulan_selesai', v)} options={BULAN_OPTIONS} />
            <FormSelect label="Tahun Selesai" value={item.tahun_selesai} onChange={(v) => update(item.id, 'tahun_selesai', v)} options={TAHUN_OPTIONS} />
          </div>
        </div>
      ))}
    </div>
  );
}
