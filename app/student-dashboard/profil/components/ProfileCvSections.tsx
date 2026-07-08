'use client';

import type { ReactNode } from 'react';
import type { CVData } from '@/app/student-dashboard/cv-form/types';
import { BULAN_OPTIONS } from '@/app/student-dashboard/cv-form/defaults';
import { hubunganToJapanese } from '@/lib/cv-hubungan';

function bulanLabel(v: string): string {
  return BULAN_OPTIONS.find((b) => b.value === v)?.label ?? v ?? '—';
}

function yaTidakLabel(value: unknown): string {
  const str = String(value).trim().toLowerCase();
  if (str === 'ya' || str === '1') return 'Ya (はい)';
  if (str === 'tidak' || str === '0') return 'Tidak (いいえ)';
  return '—';
}

function adaTidakLabel(value: unknown): string {
  const str = String(value).trim().toLowerCase();
  if (str === 'ada' || str === '1') return 'Ada (あり)';
  if (str === 'tidak ada' || str === '0') return 'Tidak ada (無し)';
  return '—';
}

function butaWarnaLabel(value: unknown): string {
  const str = String(value).trim().toLowerCase();
  if (str === 'buta warna total' || str === '1') return 'Buta warna total (全色)';
  if (str === 'buta warna parsial' || str === '2') return 'Buta warna parsial (部分的)';
  if (str === 'tidak buta warna' || str === '3') return 'Tidak buta warna (色盲なし)';
  return '—';
}

/** Jumlah rokok: hanya null/undefined yang tampilkan —, selain itu selalu "X Batang / hari" */
function jumlahRokokLabel(value: unknown): string {
  if (value == null) return '—';
  return `${value} Batang / hari`;
}

/** Status kelulusan sertifikat: 0=tidak lulus, 1=lulus */
function statusKelulusanLabel(value: unknown): string {
  switch (Number(value)) {
    case 0: return 'Tidak lulus';
    case 1: return 'Lulus';
    default: return String(value ?? '—');
  }
}

function jenisKelaminLabel(v: string): string {
  const norm = (v || '').trim().toUpperCase();
  if (norm === 'LAKI-LAKI' || norm === 'L') return 'Laki-laki (男)';
  if (norm === 'PEREMPUAN' || norm === 'P') return 'Perempuan (女)';
  return v || '—';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Row({ label, value }: { label: string; value: any }) {
  const str = value != null ? String(value) : '';
  const show = str.trim();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,200px)_1fr] gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0 text-sm">
      <dt className="text-gray-500 font-medium">{label}</dt>
      <dd className="text-gray-900 break-words">{show || '—'}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-900/80 mb-4 pb-2 border-b border-emerald-900/10">
      {children}
    </h3>
  );
}

export default function ProfileCvSections({ data }: { data: CVData }) {
  const i = data.informasi_dasar;
  const f = data.fisik_kesehatan;
  const d = data.dokumen;

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle>Informasi dasar</SectionTitle>
        <dl>
          <Row label="NIK" value={i.nik} />
          <Row label="No. peserta" value={i.no_peserta} />
          <Row label="Nama lengkap" value={i.nama_lengkap} />
          <Row label="Nama katakana" value={i.nama_katakana} />
          <Row label="呼称 / Nama panggilan" value={i.yobisho} />
          <Row label="Umur" value={i.umur} />
          <Row label="Jenis kelamin" value={jenisKelaminLabel(i.jenis_kelamin)} />
          <Row label="Kewarganegaraan" value={i.kewarganegaraan} />
          <Row label="Tanggal lahir" value={i.tanggal_lahir} />
          <Row label="Golongan darah" value={i.golongan_darah} />
          <Row label="Agama" value={i.agama} />
          <Row label="Status pernikahan" value={i.status_pernikahan} />
          <Row label="Alamat lengkap" value={i.alamat_lengkap} />
          <Row label="Kode pos" value={i.kode_pos} />
          <Row label="Nomor telepon" value={i.nomor_telepon} />
          <Row label="Email" value={i.email} />
        </dl>
      </section>

      <section>
        <SectionTitle>Meta dokumen</SectionTitle>
        <dl>
          <Row label="Tanggal pembuatan CV" value={data.meta.tanggal_pembuatan_cv} />
        </dl>
      </section>

      <section>
        <SectionTitle>Dokumen pendukung</SectionTitle>
        <ul className="text-sm space-y-0">
          {(
            [
              ['KTP', d.ktp],
              ['Kartu Keluarga', d.kk],
              ['Akte kelahiran', d.akte_kelahiran],
              ['Ijazah terakhir', d.ijazah_terakhir],
            ] as const
          ).map(([label, val]) => (
            <li key={label} className="flex justify-between items-center gap-4 border-b border-gray-100 py-2.5 last:border-0">
              <span className="text-gray-600 font-medium">{label}</span>
              {val ? (
                <a
                  href={val}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase border border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors px-3 py-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download
                </a>
              ) : (
                <span className="text-gray-400 text-xs italic">Belum diunggah</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle>Fisik & kesehatan</SectionTitle>
        <dl>
          <Row label="Tinggi badan (cm)" value={f.tinggi_badan} />
          <Row label="Berat badan (kg)" value={f.berat_badan} />
          <Row label="Visus mata kiri" value={f.visus_mata_kiri} />
          <Row label="Kondisi mata kiri" value={f.kondisi_mata_kiri} />
          <Row label="Visus mata kanan" value={f.visus_mata_kanan} />
          <Row label="Kondisi mata kanan" value={f.kondisi_mata_kanan} />
          <Row label="Berkacamata" value={yaTidakLabel(f.berkacamata)} />
          <Row label="Tato" value={adaTidakLabel(f.tato)} />
          <Row label="Merokok" value={yaTidakLabel(f.merokok)} />
          <Row label="Jumlah rokok" value={jumlahRokokLabel(f.jumlah_rokok)} />
          <Row label="Buta warna" value={butaWarnaLabel(f.buta_warna)} />
          <Row label="Riwayat patah tulang" value={adaTidakLabel(f.riwayat_patah_tulang)} />
          <Row label="Hobi" value={f.hobi} />
        </dl>
      </section>

      <section>
        <SectionTitle>Riwayat pendidikan</SectionTitle>
        {data.pendidikan.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.pendidikan.map((p, idx) => (
              <li
                key={p.id || idx}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 text-sm space-y-1"
              >
                <p className="font-semibold text-gray-900">{p.nama_sekolah || '—'}</p>
                <p className="text-gray-600">
                  {p.tingkat_pendidikan}
                  {p.jurusan ? ` · ${p.jurusan}` : ''}
                </p>
                <p className="text-gray-500 text-xs">
                  {bulanLabel(p.bulan_masuk)} {p.tahun_masuk} — {bulanLabel(p.bulan_lulus)}{' '}
                  {p.tahun_lulus}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Riwayat pekerjaan</SectionTitle>
        {data.pekerjaan.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.pekerjaan.map((p, idx) => (
              <li
                key={p.id || idx}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 text-sm space-y-1"
              >
                <p className="font-semibold text-gray-900">{p.nama_perusahaan || '—'}</p>
                <p className="text-gray-600">
                  {p.posisi_pekerjaan}
                  {p.status_pekerjaan ? ` · ${p.status_pekerjaan}` : ''}
                </p>
                <p className="text-gray-500 text-xs">
                  {bulanLabel(p.bulan_mulai)} {p.tahun_mulai} — {bulanLabel(p.bulan_selesai)}{' '}
                  {p.tahun_selesai}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Sertifikat</SectionTitle>
        {data.sertifikat.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.sertifikat.map((s, idx) => (
              <li
                key={s.id || idx}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 text-sm space-y-1"
              >
                <p className="font-semibold text-gray-900">{s.nama_sertifikat || '—'}</p>
                <p className="text-gray-600">
                  {statusKelulusanLabel(s.status_kelulusan)}
                  {s.keterangan_skor ? ` · ${s.keterangan_skor}` : ''}
                </p>
                <p className="text-gray-500 text-xs">
                  {bulanLabel(s.bulan_diperoleh)} {s.tahun_diperoleh}
                </p>
                {s.foto_sertifikat ? (
                  <div className="pt-3">
                    <a
                      href={s.foto_sertifikat}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase border border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors px-3 py-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      Download Lampiran
                    </a>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Susunan keluarga</SectionTitle>
        {data.keluarga.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.keluarga.map((k, idx) => (
              <li
                key={k.id || idx}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 text-sm space-y-1"
              >
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {hubunganToJapanese(k.hubungan) || '—'}
                </p>
                <p className="font-semibold text-gray-900 break-words">{k.nama_anggota || '—'}</p>
                <p className="text-gray-600">
                  {k.umur ? `${k.umur} th` : '—'}
                  {k.pekerjaan ? ` · ${k.pekerjaan}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
