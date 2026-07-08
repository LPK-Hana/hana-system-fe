'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from './FormControls';
import type { RiwayatPendidikan } from '../types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '../defaults';

interface Props {
  items: RiwayatPendidikan[];
  onChange: (items: RiwayatPendidikan[]) => void;
  errors?: Record<string, string>;
}

const TINGKAT_OPTIONS = [
  { value: 'SD', label: 'SD（小学校）' },
  { value: 'SMP', label: 'SMP（中学校）' },
  { value: 'SMA', label: 'SMA（高校）' },
  { value: 'SMK', label: 'SMK（専門学校）' },
  { value: 'D3', label: 'D3（3年制大学）' },
  { value: 'S1', label: 'S1（4年制大学）' },
];
const NEEDS_JURUSAN = ['SMA', 'SMK', 'D3', 'S1'];

const SMA_JURUSAN_OPTIONS = [
  { value: '科学', label: '科学 / IPA' },
  { value: '社会', label: '社会 / IPS' },
];

const SMK_JURUSAN_OPTIONS = [
  { value: '機械工学', label: '機械工学 / Teknik Mesin' },
  { value: '電気工学', label: '電気工学 / Teknik Elektro' },
  { value: '航海学', label: '航海学 / Pelayaran' },
  { value: 'コンピュータネットワーク工学', label: 'コンピュータネットワーク工学 / Teknik Jaringan Komputer' },
  { value: 'バイク整備', label: 'バイク整備 / Teknik Sepeda Motor' },
  { value: '自動車整備', label: '自動車整備 / Teknik Kendaraan Ringan' },
  { value: '宗教学', label: '宗教学 / Agama' },
  { value: '事務学', label: '事務学 / Administrasi Perkantoran' },
  { value: '会計学', label: '会計学 / Akuntansi' },
  { value: '縫製学', label: '縫製学 / Tata Busana' },
  { value: '建築学', label: '建築学 / Teknik Bangunan' },
  { value: '薬剤学', label: '薬剤学 / Farmasi' },
  { value: '看護師', label: '看護師 / Keperawatan' },
  { value: '宿泊学', label: '宿泊学 / Perhotelan' },
  { value: '農業学', label: '農業学 / Pertanian' },
  { value: 'マルチメディア', label: 'マルチメディア / Multimedia' },
  { value: '調理学', label: '調理学 / Tata Boga' },
];

const KULIAH_JURUSAN_OPTIONS = [
  { value: '情報工学', label: '情報工学 / Teknik Informatika' },
  { value: '情報システム学', label: '情報システム学 / Sistem Informasi' },
  { value: '日本文学', label: '日本文学 / Sastra Jepang' },
  { value: '経営学', label: '経営学 / Manajemen' },
  { value: '会計学', label: '会計学 / Akuntansi' },
  { value: '産業工学', label: '産業工学 / Teknik Industri' },
  { value: '土木工学', label: '土木工学 / Teknik Sipil' },
  { value: '心理学', label: '心理学 / Psikologi' },
  { value: 'コミュニケーション学', label: 'コミュニケーション学 / Ilmu Komunikasi' },
  { value: '法学', label: '法学 / Hukum' },
  { value: '看護学', label: '看護学 / Keperawatan' },
  { value: 'ビジュアルコミュニケーションデザイン', label: 'ビジュアルコミュニケーションデザイン / Desain Komunikasi Visual (DKV)' },
  { value: '電気工学', label: '電気工学 / Teknik Elektro' },
  { value: '薬学', label: '薬学 / Farmasi' },
  { value: '国際関係学', label: '国際関係学 / Hubungan Internasional' },
  { value: '経営管理学', label: '経営管理学 / Administrasi Bisnis' },
  { value: '英語教育学', label: '英語教育学 / Pendidikan Bahasa Inggris' },
  { value: '建築学', label: '建築学 / Arsitektur' },
  { value: '機械工学', label: '機械工学 / Teknik Mesin' },
  { value: 'データサイエンス', label: 'データサイエンス / Data Science' },
];

const emptyItem = (): RiwayatPendidikan => ({
  id: crypto.randomUUID(),
  tahun_masuk: '', bulan_masuk: '', tahun_lulus: '', bulan_lulus: '',
  nama_sekolah: '', tingkat_pendidikan: '', jurusan: '',
});

export default function StepPendidikan({ items, onChange, errors = {} }: Props) {
  const [manualJurusanMap, setManualJurusanMap] = useState<Record<string, boolean>>({});

  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof RiwayatPendidikan, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  const isUnlisted = (tingkat: string, jur: string) => {
    if (!jur) return false;
    if (tingkat === 'SMA') return !SMA_JURUSAN_OPTIONS.some(o => o.value === jur);
    if (tingkat === 'SMK') return !SMK_JURUSAN_OPTIONS.some(o => o.value === jur);
    if (tingkat === 'D3' || tingkat === 'S1') return !KULIAH_JURUSAN_OPTIONS.some(o => o.value === jur);
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">学歴を最も古いものから追加してください。</p>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition">
          <Plus size={16} /> Tambah
        </button>
      </div>
      {items.length === 0 && (
        <div
          id="field-pendidikan-empty"
          className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl"
        >
          学歴データなし / Belum ada data pendidikan
        </div>
      )}
      {items.map((item, idx) => (
        <div key={item.id} id={`pendidikan-${item.id}`} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600">学歴 #{idx + 1}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id={`field-pendidikan-nama-${item.id}`}
              label="学校名 / Nama Sekolah / Universitas"
              value={item.nama_sekolah}
              onChange={(v) => update(item.id, 'nama_sekolah', v)}
              placeholder="Contoh: SMAN 1 Bandung"
              required
              error={errors[`pendidikan-${item.id}-nama_sekolah`]}
            />
            <FormSelect
              id={`field-pendidikan-tingkat-${item.id}`}
              label="学歴レベル / Tingkat Pendidikan"
              value={item.tingkat_pendidikan}
              onChange={(v) => {
                const newItems = items.map((i) =>
                  i.id === item.id ? { ...i, tingkat_pendidikan: v, jurusan: '' } : i
                );
                onChange(newItems);
                setManualJurusanMap((prev) => ({ ...prev, [item.id]: false }));
              }}
              options={TINGKAT_OPTIONS}
              required
              error={errors[`pendidikan-${item.id}-tingkat_pendidikan`]}
            />
            {(() => {
              if (!NEEDS_JURUSAN.includes(item.tingkat_pendidikan)) return null;

              const isSMA = item.tingkat_pendidikan === 'SMA';
              const isSMK = item.tingkat_pendidikan === 'SMK';
              
              const options = isSMA ? SMA_JURUSAN_OPTIONS : (isSMK ? SMK_JURUSAN_OPTIONS : KULIAH_JURUSAN_OPTIONS);
              const selectOptions = [...options, { value: 'Other', label: 'Lainnya (Isi Manual)' }];
              const isCustom = manualJurusanMap[item.id] || isUnlisted(item.tingkat_pendidikan, item.jurusan);

              return (
                <>
                  <FormSelect
                    id={`field-pendidikan-jurusan-select-${item.id}`}
                    label="専攻 / Jurusan"
                    value={isCustom ? 'Other' : item.jurusan}
                    onChange={(v) => {
                      if (v === 'Other') {
                        setManualJurusanMap(prev => ({ ...prev, [item.id]: true }));
                        update(item.id, 'jurusan', '');
                      } else {
                        setManualJurusanMap(prev => ({ ...prev, [item.id]: false }));
                        update(item.id, 'jurusan', v);
                      }
                    }}
                    options={selectOptions}
                    required={!isCustom}
                    error={!isCustom ? errors[`pendidikan-${item.id}-jurusan`] : undefined}
                  />
                  {isCustom && (
                    <FormField
                      id={`field-pendidikan-jurusan-${item.id}`}
                      label="Jurusan (Manual)"
                      value={item.jurusan}
                      onChange={(v) => update(item.id, 'jurusan', v)}
                      placeholder="Ketik jurusan anda..."
                      required
                      error={errors[`pendidikan-${item.id}-jurusan`]}
                    />
                  )}
                </>
              );
            })()}
            <FormSelect
              id={`field-pendidikan-bulan_masuk-${item.id}`}
              label="入学月 / Bulan Masuk"
              value={item.bulan_masuk}
              onChange={(v) => update(item.id, 'bulan_masuk', v)}
              options={BULAN_OPTIONS}
              error={errors[`pendidikan-${item.id}-bulan_masuk`]}
            />
            <FormSelect
              id={`field-pendidikan-tahun_masuk-${item.id}`}
              label="入学年 / Tahun Masuk"
              value={item.tahun_masuk}
              onChange={(v) => update(item.id, 'tahun_masuk', v)}
              options={TAHUN_OPTIONS}
              error={errors[`pendidikan-${item.id}-tahun_masuk`]}
            />
            <FormSelect
              id={`field-pendidikan-bulan_lulus-${item.id}`}
              label="卒業月 / Bulan Lulus"
              value={item.bulan_lulus}
              onChange={(v) => update(item.id, 'bulan_lulus', v)}
              options={BULAN_OPTIONS}
              error={errors[`pendidikan-${item.id}-bulan_lulus`]}
            />
            <FormSelect
              id={`field-pendidikan-tahun_lulus-${item.id}`}
              label="卒業年 / Tahun Lulus"
              value={item.tahun_lulus}
              onChange={(v) => update(item.id, 'tahun_lulus', v)}
              options={TAHUN_OPTIONS}
              error={errors[`pendidikan-${item.id}-tahun_lulus`]}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
