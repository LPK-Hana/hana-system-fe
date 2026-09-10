'use client';
import { useState } from 'react';
import { FormField, FormSelect } from './FormControls';
import type { FisikKesehatan } from '../types';

interface Props {
  data: FisikKesehatan;
  onChange: (d: FisikKesehatan) => void;
  errors?: Record<string, string>;
}

const KONDISI_MATA = [
  { value: 'Normal', label: '異常なし / Normal' },
  { value: 'Minus', label: 'マイナス / Minus' },
  { value: 'Silinder', label: '乱視 / Silinder' },
];
const YA_TIDAK = [
  { value: 'Ya', label: 'はい / Ya' },
  { value: 'Tidak', label: 'いいえ / Tidak' },
];
const ADA_TIDAK = [
  { value: 'Ada', label: 'あり / Ada' },
  { value: 'Tidak Ada', label: '無し / Tidak Ada' },
];
const BUTA_WARNA_OPTIONS = [
  { value: 'Tidak Buta Warna', label: 'いいえ / Tidak Buta Warna' },
  { value: 'Buta Warna Parsial', label: 'はい（部分的）/ Parsial' },
  { value: 'Buta Warna Total', label: 'はい（全色）/ Total' },
];

const HOBI_OPTIONS = [
  { value: 'ゲーム', label: 'ゲーム / Bermain game' },
  { value: '映画・ドラマ鑑賞', label: '映画・ドラマ鑑賞 / Menonton film / series' },
  { value: '音楽鑑賞', label: '音楽鑑賞 / Mendengarkan musik' },
  { value: 'スポーツ', label: 'スポーツ / Olahraga' },
  { value: '料理', label: '料理 / Memasak' },
  { value: '旅行', label: '旅行 / Traveling' },
  { value: '写真撮影', label: '写真撮影 / Fotografi' },
  { value: '釣り', label: '釣り / Memancing' },
  { value: '園芸', label: '園芸 / Berkebun' },
  { value: '読書', label: '読書 / Membaca buku' },
  { value: '絵を描くこと', label: '絵を描くこと / Menggambar' },
  { value: 'SNS', label: 'SNS / Bermain media sosial' },
  { value: 'アイテム収集', label: 'アイテム収集 / Koleksi barang' },
  { value: 'プログラミング', label: 'プログラミング / Programming' },
  { value: '株式投資・トレーディング', label: '株式投資・トレーディング / Trading & investasi saham' },
  { value: 'カラオケ・歌うこと', label: 'カラオケ・歌うこと / Bernyanyi' },
  { value: '執筆', label: '執筆 / Menulis' },
  { value: 'サイクリング', label: 'サイクリング / Bersepeda' },
  { value: 'グルメ巡り', label: 'グルメ巡り / Kulineran' },
  { value: '外国語学習', label: '外国語学習 / Belajar bahasa asing' },
];

export default function StepFisik({ data, onChange, errors = {} }: Props) {
  const [isManualHobi, setIsManualHobi] = useState(false);
  const set = (key: keyof FisikKesehatan, val: string) => onChange({ ...data, [key]: val });

  const isUnlistedHobi = (hobi: string) => {
    if (!hobi) return false;
    return !HOBI_OPTIONS.some(o => o.value === hobi);
  };

  const isCustomHobi = isManualHobi || isUnlistedHobi(data.hobi);
  const selectHobiOptions = [...HOBI_OPTIONS, { value: 'Other', label: 'Lainnya (Isi Manual)' }];

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">📏 身体データ / Data Fisik</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="field-tinggi_badan" label="身長 / Tinggi Badan (cm)" value={data.tinggi_badan} onChange={(v) => set('tinggi_badan', v.replace(/\D/g, ''))} type="text" inputMode="numeric" placeholder="170" required autoUppercase={false} error={errors['tinggi_badan']} />
          <FormField id="field-berat_badan" label="体重 / Berat Badan (kg)" value={data.berat_badan} onChange={(v) => set('berat_badan', v.replace(/\D/g, ''))} type="text" inputMode="numeric" placeholder="65" required autoUppercase={false} error={errors['berat_badan']} />
        </div>
      </section>
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">👁️ 視力 / Kondisi Mata</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="field-visus_mata_kiri" label="左目 OS / Visus Mata Kiri" value={data.visus_mata_kiri} onChange={(v) => set('visus_mata_kiri', v)} type="text" inputMode="decimal" placeholder="Contoh: 1.5" autoUppercase={false} />
          <FormSelect id="field-kondisi_mata_kiri" label="左目状態 / Kondisi Mata Kiri" value={data.kondisi_mata_kiri} onChange={(v) => set('kondisi_mata_kiri', v)} options={KONDISI_MATA} error={errors['kondisi_mata_kiri']} />
          <FormField id="field-visus_mata_kanan" label="右目 OD / Visus Mata Kanan" value={data.visus_mata_kanan} onChange={(v) => set('visus_mata_kanan', v)} type="text" inputMode="decimal" placeholder="Contoh: 1.5" autoUppercase={false} />
          <FormSelect id="field-kondisi_mata_kanan" label="右目状態 / Kondisi Mata Kanan" value={data.kondisi_mata_kanan} onChange={(v) => set('kondisi_mata_kanan', v)} options={KONDISI_MATA} error={errors['kondisi_mata_kanan']} />
          <FormSelect id="field-berkacamata" label="メガネ / Berkacamata" value={data.berkacamata} onChange={(v) => set('berkacamata', v)} options={YA_TIDAK} error={errors['berkacamata']} />
          <FormSelect id="field-buta_warna" label="色盲 / Buta Warna" value={data.buta_warna} onChange={(v) => set('buta_warna', v)} options={BUTA_WARNA_OPTIONS} error={errors['buta_warna']} />
        </div>
      </section>
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">🏥 健康・その他 / Kesehatan & Lainnya</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect id="field-tato" label="タトゥ / Tato" value={data.tato} onChange={(v) => set('tato', v)} options={ADA_TIDAK} error={errors['tato']} />
          <FormSelect id="field-riwayat_patah_tulang" label="骨折歴 / Riwayat Patah Tulang" value={data.riwayat_patah_tulang} onChange={(v) => set('riwayat_patah_tulang', v)} options={ADA_TIDAK} error={errors['riwayat_patah_tulang']} />
          <FormSelect id="field-merokok" label="タバコ / Merokok" value={data.merokok} onChange={(v) => set('merokok', v)} options={YA_TIDAK} error={errors['merokok']} />
          {data.merokok === 'Ya' && (
            <FormField id="field-jumlah_rokok" label="1日の本数 / Jumlah Rokok per Hari" value={data.jumlah_rokok} onChange={(v) => set('jumlah_rokok', v.replace(/\D/g, ''))} type="text" inputMode="numeric" placeholder="Contoh: 2" autoUppercase={false} error={errors['jumlah_rokok']} />
          )}
          <div className="sm:col-span-2 space-y-4">
            <FormSelect
              id="field-hobi-select"
              label="趣味 / Hobi"
              value={isCustomHobi ? 'Other' : data.hobi}
              onChange={(v) => {
                if (v === 'Other') {
                  setIsManualHobi(true);
                  set('hobi', '');
                } else {
                  setIsManualHobi(false);
                  set('hobi', v);
                }
              }}
              options={selectHobiOptions}
            />
            {isCustomHobi && (
              <FormField
                id="field-hobi"
                label="Hobi (Manual)"
                value={data.hobi}
                onChange={(v) => set('hobi', v)}
                placeholder="Contoh: Membaca, Olahraga"
                autoUppercase={false}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
