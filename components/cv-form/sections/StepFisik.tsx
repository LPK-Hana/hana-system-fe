'use client';
import { FormField, FormSelect } from '../ui/FormControls';
import type { FisikKesehatan } from '@/types/cv.types';

interface Props {
  data: FisikKesehatan;
  onChange: (d: FisikKesehatan) => void;
}

const KONDISI_MATA = ['Normal', 'Minus', 'Silinder'].map((v) => ({ value: v, label: v }));
const YA_TIDAK = [
  { value: 'Ya', label: 'Ya (はい)' },
  { value: 'Tidak', label: 'Tidak (いいえ)' },
];
const ADA_TIDAK = [
  { value: 'Ada', label: 'Ada' },
  { value: 'Tidak Ada', label: 'Tidak Ada (無し)' },
];

export default function StepFisik({ data, onChange }: Props) {
  const set = (key: keyof FisikKesehatan, val: string) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          📏 Data Fisik
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Tinggi Badan (cm)" value={data.tinggi_badan} onChange={(v) => set('tinggi_badan', v)} type="number" placeholder="170" required />
          <FormField label="Berat Badan (kg)" value={data.berat_badan} onChange={(v) => set('berat_badan', v)} type="number" placeholder="65" required />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          👁️ Kondisi Mata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Visus Mata Kiri" value={data.visus_mata_kiri} onChange={(v) => set('visus_mata_kiri', v)} placeholder="Contoh: 1.5" />
          <FormSelect label="Kondisi Mata Kiri" value={data.kondisi_mata_kiri} onChange={(v) => set('kondisi_mata_kiri', v)} options={KONDISI_MATA} />
          <FormField label="Visus Mata Kanan" value={data.visus_mata_kanan} onChange={(v) => set('visus_mata_kanan', v)} placeholder="Contoh: 1.5" />
          <FormSelect label="Kondisi Mata Kanan" value={data.kondisi_mata_kanan} onChange={(v) => set('kondisi_mata_kanan', v)} options={KONDISI_MATA} />
          <FormSelect label="Berkacamata" value={data.berkacamata} onChange={(v) => set('berkacamata', v)} options={YA_TIDAK} />
          <FormSelect label="Buta Warna" value={data.buta_warna} onChange={(v) => set('buta_warna', v)} options={ADA_TIDAK} />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          🏥 Riwayat Kesehatan & Lainnya
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect label="Tato" value={data.tato} onChange={(v) => set('tato', v)} options={ADA_TIDAK} />
          <FormSelect label="Riwayat Patah Tulang" value={data.riwayat_patah_tulang} onChange={(v) => set('riwayat_patah_tulang', v)} options={ADA_TIDAK} />
          <FormSelect label="Merokok" value={data.merokok} onChange={(v) => set('merokok', v)} options={YA_TIDAK} />
          {data.merokok === 'Ya' && (
            <FormField
              label="Jumlah Rokok per Hari"
              value={data.jumlah_rokok}
              onChange={(v) => set('jumlah_rokok', v)}
              placeholder="Contoh: 2 batang"
            />
          )}
          <FormField
            label="Hobi"
            value={data.hobi}
            onChange={(v) => set('hobi', v)}
            placeholder="Contoh: Membaca, Olahraga"
            className="sm:col-span-2"
          />
        </div>
      </section>
    </div>
  );
}
