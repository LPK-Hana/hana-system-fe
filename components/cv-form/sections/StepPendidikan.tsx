'use client';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from '../ui/FormControls';
import type { RiwayatPendidikan } from '@/types/cv.types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '@/lib/cv-defaults';

interface Props {
  items: RiwayatPendidikan[];
  onChange: (items: RiwayatPendidikan[]) => void;
}

const TINGKAT_OPTIONS = ['SD', 'SMP', 'SMA', 'SMK', 'D3', 'S1'].map((v) => ({ value: v, label: v }));
const NEEDS_JURUSAN = ['SMA', 'SMK', 'D3', 'S1'];

const emptyItem = (): RiwayatPendidikan => ({
  id: crypto.randomUUID(),
  tahun_masuk: '', bulan_masuk: '', tahun_lulus: '', bulan_lulus: '',
  nama_sekolah: '', tingkat_pendidikan: '', jurusan: '',
});

export default function StepPendidikan({ items, onChange }: Props) {
  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof RiwayatPendidikan, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Tambahkan riwayat pendidikan dari yang paling awal.</p>
        <button
          onClick={add}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Belum ada data pendidikan
        </div>
      )}

      {items.map((item, idx) => (
        <div key={item.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600">
              Pendidikan #{idx + 1}
            </span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Sekolah / Universitas" value={item.nama_sekolah} onChange={(v) => update(item.id, 'nama_sekolah', v)} placeholder="Contoh: SMAN 1 Bandung" required />
            <FormSelect label="Tingkat Pendidikan" value={item.tingkat_pendidikan} onChange={(v) => update(item.id, 'tingkat_pendidikan', v)} options={TINGKAT_OPTIONS} required />
            {NEEDS_JURUSAN.includes(item.tingkat_pendidikan) && (
              <FormField label="Jurusan" value={item.jurusan} onChange={(v) => update(item.id, 'jurusan', v)} placeholder="Contoh: Teknik Informatika" />
            )}
            <FormSelect label="Bulan Masuk" value={item.bulan_masuk} onChange={(v) => update(item.id, 'bulan_masuk', v)} options={BULAN_OPTIONS} />
            <FormSelect label="Tahun Masuk" value={item.tahun_masuk} onChange={(v) => update(item.id, 'tahun_masuk', v)} options={TAHUN_OPTIONS} />
            <FormSelect label="Bulan Lulus" value={item.bulan_lulus} onChange={(v) => update(item.id, 'bulan_lulus', v)} options={BULAN_OPTIONS} />
            <FormSelect label="Tahun Lulus" value={item.tahun_lulus} onChange={(v) => update(item.id, 'tahun_lulus', v)} options={TAHUN_OPTIONS} />
          </div>
        </div>
      ))}
    </div>
  );
}
