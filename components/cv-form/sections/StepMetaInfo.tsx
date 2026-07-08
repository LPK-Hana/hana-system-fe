'use client';
import { FormField, FormSelect } from '../ui/FormControls';
import type { MetaData, InformasiDasar } from '@/types/cv.types';

interface Props {
  meta: MetaData;
  info: InformasiDasar;
  onMetaChange: (d: MetaData) => void;
  onInfoChange: (d: InformasiDasar) => void;
}

const JK_OPTIONS = [
  { value: 'Laki-laki', label: 'Laki-laki (男)' },
  { value: 'Perempuan', label: 'Perempuan (女)' },
];
const GOLDAR_OPTIONS = ['A', 'B', 'AB', 'O'].map((v) => ({ value: v, label: v }));
const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((v) => ({
  value: v, label: v,
}));
const STATUS_OPTIONS = [
  { value: 'Lajang', label: 'Lajang (独身)' },
  { value: 'Menikah', label: 'Menikah (既婚)' },
  { value: 'Cerai', label: 'Cerai' },
];

export default function StepMetaInfo({ meta, info, onMetaChange, onInfoChange }: Props) {
  const setMeta = (key: keyof MetaData, val: string) =>
    onMetaChange({ ...meta, [key]: val });
  const setInfo = (key: keyof InformasiDasar, val: string) =>
    onInfoChange({ ...info, [key]: val });

  return (
    <div className="space-y-8">
      {/* Meta */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          📋 Meta Dokumen
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Tanggal Pembuatan CV"
            value={meta.tanggal_pembuatan_cv}
            onChange={(v) => setMeta('tanggal_pembuatan_cv', v)}
            type="date"
            required
          />
          <FormField
            label="Nomor Kandidat"
            value={meta.nomor_kandidat}
            onChange={(v) => setMeta('nomor_kandidat', v)}
            placeholder="Contoh: 001"
          />
        </div>
      </section>

      {/* Informasi Dasar */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          👤 Informasi Dasar (基本情報)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nama Lengkap" value={info.nama_lengkap} onChange={(v) => setInfo('nama_lengkap', v)} placeholder="Sesuai KTP" required />
          <FormField label="Nama Katakana" value={info.nama_katakana} onChange={(v) => setInfo('nama_katakana', v)} placeholder="Contoh: ジダン" hint="Cara baca nama dalam Katakana" />
          <FormField label="Umur" value={info.umur} onChange={(v) => setInfo('umur', v)} type="number" placeholder="25" required />
          <FormSelect label="Jenis Kelamin" value={info.jenis_kelamin} onChange={(v) => setInfo('jenis_kelamin', v)} options={JK_OPTIONS} required />
          <FormField label="Kewarganegaraan" value={info.kewarganegaraan} onChange={(v) => setInfo('kewarganegaraan', v)} placeholder="Indonesia" required />
          <FormField label="Tanggal Lahir" value={info.tanggal_lahir} onChange={(v) => setInfo('tanggal_lahir', v)} type="date" required />
          <FormSelect label="Golongan Darah" value={info.golongan_darah} onChange={(v) => setInfo('golongan_darah', v)} options={GOLDAR_OPTIONS} />
          <FormSelect label="Agama" value={info.agama} onChange={(v) => setInfo('agama', v)} options={AGAMA_OPTIONS} required />
          <FormSelect label="Status Pernikahan" value={info.status_pernikahan} onChange={(v) => setInfo('status_pernikahan', v)} options={STATUS_OPTIONS} required />
          <FormField label="Kode Pos" value={info.kode_pos} onChange={(v) => setInfo('kode_pos', v)} placeholder="12345" />
          <FormField label="Nomor Telepon" value={info.nomor_telepon} onChange={(v) => setInfo('nomor_telepon', v)} placeholder="+62 812 3456 7890" required />
          <FormField label="Email" value={info.email} onChange={(v) => setInfo('email', v)} type="email" placeholder="nama@email.com" required />
          <FormField label="Alamat Lengkap" value={info.alamat_lengkap} onChange={(v) => setInfo('alamat_lengkap', v)} type="textarea" placeholder="RT/RW, Desa, Kecamatan, Kabupaten, Provinsi" required className="sm:col-span-2" />
        </div>
      </section>
    </div>
  );
}
