'use client';
import React from 'react';
import { CVData } from '../types';
import hanaLogo from '@/logo/hana-logo.png';

interface Props {
  data: CVData;
  interviewNumber?: string;
}

/* ── helpers ── */
const jender = (v: string) => {
  const norm = (v || '').trim().toUpperCase();
  if (norm === 'LAKI-LAKI' || norm === 'L') return '男';
  if (norm === 'PEREMPUAN' || norm === 'P') return '女';
  return '-';
};
const statusNikah = (v: string) => ({ Lajang: '独身', Menikah: '既婚', Cerai: '離婚' }[v] ?? '-');
const yaTidak = (v: string) => (v === 'Ya' ? 'はい' : v === 'Tidak' ? 'いいえ' : '-');
import { hubunganToJapanese } from '@/lib/cv-hubungan';
const adaTidak = (v: string) => (v === 'Ada' ? 'あり' : v === 'Tidak Ada' ? '無し' : v || '-');
const butaWarna = (v: string) => ({ 'Tidak Buta Warna': 'いいえ', 'Buta Warna Parsial': 'はい（部分的）', 'Buta Warna Total': 'はい（全色）' }[v] ?? '-');
const formatDate = (d: string) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`;
};
const tingkat = (v: string) => ({ SD: 'SD（小学校）', SMP: 'SMP（中学校）', SMA: 'SMA（高校）', SMK: 'SMK（専門学校）', D3: 'D3（3年制大学）', S1: 'S1（4年制大学）' }[v] ?? v);
const workStatus = (v: string) => ({ Magang: '実習', 'Karyawan Kontrak': '契約社員', 'Karyawan Tetap': '正社員' }[v] ?? v);
const kondisiMata = (v: string) => {
  const norm = (v || '').trim().toLowerCase();
  if (norm === 'normal') return '異常なし';
  if (norm === 'minus') return 'マイナス';
  if (norm === 'silinder') return '乱視';
  return v;
};

/* ── style helpers ── */
const B = '1px solid #000';
const cell = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: B, padding: '4px 6px', verticalAlign: 'middle', fontSize: '10px', ...extra,
});
const label = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...cell(), backgroundColor: '#f2f2f2', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal', ...extra,
});
const secTab = (): React.CSSProperties => ({
  backgroundColor: '#dae3f3', color: '#000', padding: '4px 24px',
  fontSize: '11px', fontWeight: 'bold', display: 'inline-block',
  border: B, borderBottom: 'none', marginBottom: '-1px', position: 'relative', zIndex: 1
});
const tbl = (): React.CSSProperties => ({ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', position: 'relative', zIndex: 0 });

export default function CVTemplate({ data, interviewNumber }: Props) {
  const { meta, informasi_dasar: info, fisik_kesehatan: fisik, pendidikan, pekerjaan, sertifikat, keluarga } = data;

  const cd = meta.tanggal_pembuatan_cv ? new Date(meta.tanggal_pembuatan_cv) : new Date();

  // Newspaper-column pairing: first half left, second half right (sesuai referensi)
  const columnPair = <T,>(arr: T[]): [T, T | undefined][] => {
    const rows = Math.ceil(arr.length / 2);
    const result: [T, T | undefined][] = [];
    for (let i = 0; i < rows; i++) {
      result.push([arr[i], arr[i + rows]]);
    }
    return result;
  };

  const sertRows = columnPair(sertifikat);
  const kelRows = columnPair(keluarga);

  return (
    <div id="cv-template" style={{
      width: '794px', backgroundColor: '#fff', padding: '28px 24px',
      fontFamily: 'var(--font-noto-sans-jp), "Noto Sans JP", "Meiryo", "MS Gothic", sans-serif',
      fontSize: '11px', color: '#000', boxSizing: 'border-box', margin: '0 auto'
    }}>
      {/* ── HEADER ── */}
      <div style={{ position: 'relative', marginBottom: '20px', height: '80px' }}>
        {/* Logo - pojok kiri atas */}
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <img
            src={hanaLogo.src}
            alt="Hana Logo"
            crossOrigin="anonymous"
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
          />
        </div>

        {/* Date - pojok kanan atas */}
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '10px' }}>
            <span>作成日：</span>
            <div style={{ backgroundColor: '#f2f2f2', padding: '4px 16px', marginLeft: '8px', minWidth: '130px', textAlign: 'center' }}>
              {cd.getFullYear()} 年 {cd.getMonth() + 1} 月 {cd.getDate()} 日
            </div>
          </div>
          {interviewNumber && (
            <div style={{ fontSize: '18px', fontWeight: 'bold', border: '2px solid #000', padding: '2px 12px', borderRadius: '4px', textAlign: 'center', minWidth: '40px' }}>
              {interviewNumber}番
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '14px', marginLeft: '14px' }}>外国人財履歴書</div>
          <div style={{ fontSize: '11px', marginTop: '6px' }}>CV Kandidat Tenaga Kerja Asing</div>
        </div>

      </div>

      {/* ── 基本情報 & Fisik (Gabungan 8 Kolom) ── */}
      <div>
        <div style={secTab()}>基本情報</div>
        <table style={tbl()}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={label()}>カタカナ</td>
              <td style={cell({ letterSpacing: '2px' })} colSpan={3}>{info.nama_katakana || '-'}</td>
              <td style={label()}>年齢</td>
              <td style={cell({ textAlign: 'center' })}>{info.umur ? `${info.umur} 歳` : '-'}</td>
              <td
                style={{ ...cell(), textAlign: 'center', verticalAlign: 'middle', padding: 0 }}
                colSpan={2}
                rowSpan={6}
              >
                {meta.foto ? (
                  // width 100% + aspectRatio 3/4 = foto penuh tanpa terpotong
                  <img
                    src={meta.foto}
                    alt="Foto kandidat"
                    style={{
                      width: '100%',
                      aspectRatio: '3 / 4',
                      objectFit: 'contain',
                      objectPosition: 'center top',
                      display: 'block',
                      backgroundColor: '#fff',
                    }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      const tried = Number(img.dataset.fallbackTried ?? 0);
                      const base = meta.foto!.replace(/\.[^.]+$/, '');
                      const exts = ['.jpg', '.jpeg', '.png', '.webp'];
                      const currentExt = (meta.foto!.match(/\.[^.]+$/) || [''])[0];
                      const nextExts = exts.filter(x => x !== currentExt);
                      if (tried < nextExts.length) {
                        img.dataset.fallbackTried = String(tried + 1);
                        img.src = base + nextExts[tried];
                      } else {
                        img.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    aspectRatio: '3 / 4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed #999',
                    color: '#bbb',
                    fontSize: '10px',
                  }}>
                    Foto 3×4
                  </div>
                )}
              </td>
            </tr>
            <tr>
              <td style={label()}>氏名</td>
              <td style={cell({ fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' })} colSpan={3}>{info.nama_lengkap || '-'}</td>
              <td style={label()}>性別</td>
              <td style={cell({ textAlign: 'center' })}>{jender(info.jenis_kelamin)}</td>
            </tr>
            <tr>
              <td style={label()}>国籍</td>
              <td style={cell({ textAlign: 'center' })}>{info.kewarganegaraan || '-'}</td>
              <td style={label()}>生年月日</td>
              <td style={cell({ textAlign: 'center' })}>{formatDate(info.tanggal_lahir)}</td>
              <td style={label()}>血液型</td>
              <td style={cell({ textAlign: 'center' })}>{info.golongan_darah ? `${info.golongan_darah}型` : '-'}</td>
            </tr>
            <tr>
              <td style={label()} rowSpan={2}>住所</td>
              <td style={cell()} colSpan={3} rowSpan={2}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>{info.alamat_lengkap || '-'}</div>
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>〒 {info.kode_pos || '-'}</div>
                </div>
              </td>
              <td style={label()}>宗教</td>
              <td style={cell({ textAlign: 'center' })}>{info.agama || '-'}</td>
            </tr>
            <tr>
              <td style={label()}>配偶者</td>
              <td style={cell({ textAlign: 'center' })}>{statusNikah(info.status_pernikahan)}</td>
            </tr>
            <tr>
              <td style={label()}>連絡先</td>
              <td style={cell()} colSpan={5}>
                {info.nomor_telepon || '-'}
                <span style={{ marginLeft: '24px' }}>メール：</span>
                <span style={{ color: '#4a86e8' }}>{info.email || '-'}</span>
              </td>
            </tr>
            <tr>
              <td style={label()}>身長</td>
              <td style={cell({ textAlign: 'center' })}>{fisik.tinggi_badan || '-'} CM</td>
              <td style={label()}>体重</td>
              <td style={cell({ textAlign: 'center' })}>{fisik.berat_badan || '-'} KG</td>
              <td style={label()}>タバコ</td>
              <td style={cell()}>
                {fisik.merokok === 'Ya' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                    <span>はい</span><span>{fisik.jumlah_rokok ? `1日${fisik.jumlah_rokok}本` : ''}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                    <span>いいえ</span><span>-</span>
                  </div>
                )}
              </td>
              <td style={label()}>呼称</td>
              <td style={cell({ textAlign: 'center', fontWeight: 'bold' })}>{info.yobisho || '-'}</td>
            </tr>
            <tr>
              <td style={label()}>左目 OS</td>
              <td style={cell()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                  <span>{fisik.visus_mata_kiri || '-'}</span><span style={{ fontSize: '9px' }}>{kondisiMata(fisik.kondisi_mata_kiri || '-')}</span>
                </div>
              </td>
              <td style={label()}>右目 OD</td>
              <td style={cell()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                  <span>{fisik.visus_mata_kanan || '-'}</span><span style={{ fontSize: '9px' }}>{kondisiMata(fisik.kondisi_mata_kanan || '-')}</span>
                </div>
              </td>
              <td style={label()}>メガネ</td>
              <td style={cell()}>
                {fisik.berkacamata === 'Ya' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}><span>はい</span><span></span></div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}><span>いいえ</span><span>-</span></div>
                )}
              </td>
              <td style={label()} rowSpan={2}>趣味</td>
              <td style={cell({ whiteSpace: 'pre-wrap', verticalAlign: 'top', paddingTop: '6px' })} rowSpan={2}>{fisik.hobi || '-'}</td>
            </tr>
            <tr>
              <td style={label()}>タトゥ</td>
              <td style={cell()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                  <span>{adaTidak(fisik.tato)}</span><span>-</span>
                </div>
              </td>
              <td style={label()}>骨折</td>
              <td style={cell()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                  <span>{adaTidak(fisik.riwayat_patah_tulang)}</span><span>-</span>
                </div>
              </td>
              <td style={label()}>色盲</td>
              <td style={cell()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                  <span>{butaWarna(fisik.buta_warna)}</span><span>-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 学歴 ── */}
      <div style={{ paddingTop: '4px' }}>
        <div style={secTab()}>学歴</div>
        <table style={tbl()}>
          <colgroup>
            <col style={{ width: '45px' }} />
            <col style={{ width: '30px' }} />
            <col style={{ width: '20px' }} />
            <col style={{ width: '45px' }} />
            <col style={{ width: '30px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '90px' }} />
          </colgroup>
          <thead>
            <tr>
              <td style={label()} colSpan={2}>入学</td>
              <td style={label()} rowSpan={2}></td>
              <td style={label()} colSpan={2}>卒業</td>
              <td style={label()} rowSpan={2}>学校名</td>
              <td style={label()} rowSpan={2}>備考</td>
              <td style={label()} rowSpan={2}>専攻</td>
            </tr>
            <tr>
              <td style={label()}>年</td>
              <td style={label()}>月</td>
              <td style={label()}>年</td>
              <td style={label()}>月</td>
            </tr>
          </thead>
          <tbody>
            {pendidikan.length === 0 && (
              <tr><td colSpan={8} style={cell({ textAlign: 'center', color: '#999' })}>-</td></tr>
            )}
            {pendidikan.map((p, i) => (
              <tr key={p.id || i}>
                <td style={cell({ textAlign: 'center' })}>{p.tahun_masuk}</td>
                <td style={cell({ textAlign: 'center' })}>{p.bulan_masuk}</td>
                <td style={cell({ textAlign: 'center' })}>〜</td>
                <td style={cell({ textAlign: 'center' })}>{p.tahun_lulus}</td>
                <td style={cell({ textAlign: 'center' })}>{p.bulan_lulus}</td>
                <td style={cell()}>{p.nama_sekolah}</td>
                <td style={cell({ textAlign: 'center' })}>{tingkat(p.tingkat_pendidikan)}</td>
                <td style={cell({ textAlign: 'center' })}>{p.jurusan || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 職歴 ── */}
      <div style={{ paddingTop: '4px' }}>
        <div style={secTab()}>職歴</div>
        <table style={tbl()}>
          <colgroup>
            <col style={{ width: '45px' }} />
            <col style={{ width: '30px' }} />
            <col style={{ width: '20px' }} />
            <col style={{ width: '45px' }} />
            <col style={{ width: '30px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '120px' }} />
          </colgroup>
          <thead>
            <tr>
              <td style={label()} colSpan={2}>入社</td>
              <td style={label()} rowSpan={2}></td>
              <td style={label()} colSpan={2}>退職</td>
              <td style={label()} rowSpan={2}>会社名</td>
              <td style={label()} rowSpan={2}>備考</td>
            </tr>
            <tr>
              <td style={label()}>年</td>
              <td style={label()}>月</td>
              <td style={label()}>年</td>
              <td style={label()}>月</td>
            </tr>
          </thead>
          <tbody>
            {pekerjaan.length === 0 && (
              <tr><td colSpan={7} style={cell({ textAlign: 'center', color: '#999' })}>-</td></tr>
            )}
            {pekerjaan.map((w, i) => (
              <tr key={w.id || i}>
                <td style={cell({ textAlign: 'center' })}>{w.tahun_mulai}</td>
                <td style={cell({ textAlign: 'center' })}>{w.bulan_mulai}</td>
                <td style={cell({ textAlign: 'center' })}>〜</td>
                <td style={cell({ textAlign: 'center' })}>{w.tahun_selesai}</td>
                <td style={cell({ textAlign: 'center' })}>{w.bulan_selesai}</td>
                <td style={cell()}>{w.nama_perusahaan}（{workStatus(w.status_pekerjaan)}）</td>
                <td style={cell({ textAlign: 'center', fontWeight: 'bold' })}>{w.posisi_pekerjaan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 免許・資格 ── */}
      <div style={{ paddingTop: '4px' }}>
        <div style={secTab()}>免許・資格</div>
        <table style={tbl()}>
          <colgroup>
            <col style={{ width: '45px' }} />
            <col style={{ width: '30px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '45px' }} />
            <col style={{ width: '30px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '90px' }} />
          </colgroup>
          <thead>
            <tr>
              <td style={label()} colSpan={2}>取得日</td>
              <td style={label()} rowSpan={2}>免許・資格</td>
              <td style={label()} rowSpan={2}>備考</td>
              <td style={label()} colSpan={2}>取得日</td>
              <td style={label()} rowSpan={2}>免許・資格</td>
              <td style={label()} rowSpan={2}>備考</td>
            </tr>
            <tr>
              <td style={label()}>年</td>
              <td style={label()}>月</td>
              <td style={label()}>年</td>
              <td style={label()}>月</td>
            </tr>
          </thead>
          <tbody>
            {sertRows.length === 0 && (
              <tr><td colSpan={8} style={cell({ textAlign: 'center', color: '#999' })}>-</td></tr>
            )}
            {sertRows.map(([left, right], i) => {
              const leftBiko = [left.status_kelulusan, left.keterangan_skor].filter(Boolean).join(' ') || '';
              const rightBiko = right ? [right.status_kelulusan, right.keterangan_skor].filter(Boolean).join(' ') || '' : '';
              return (
                <tr key={i}>
                  <td style={cell({ textAlign: 'center' })}>{left.tahun_diperoleh}</td>
                  <td style={cell({ textAlign: 'center' })}>{left.bulan_diperoleh}</td>
                  <td style={cell()}>{left.nama_sertifikat}</td>
                  <td style={cell({ textAlign: 'center' })}>{leftBiko}</td>
                  {right ? (
                    <>
                      <td style={cell({ textAlign: 'center' })}>{right.tahun_diperoleh}</td>
                      <td style={cell({ textAlign: 'center' })}>{right.bulan_diperoleh}</td>
                      <td style={cell()}>{right.nama_sertifikat}</td>
                      <td style={cell({ textAlign: 'center' })}>{rightBiko}</td>
                    </>
                  ) : (
                    <>
                      <td style={cell()}></td><td style={cell()}></td><td style={cell()}></td><td style={cell()}></td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── 家族構成 ── */}
      <div style={{ paddingTop: '4px' }}>
        <div style={secTab()}>家族構成</div>
        <table style={tbl()}>
          <colgroup>
            <col style={{ width: '56px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '44px' }} />
            <col style={{ width: '72px' }} />
            <col style={{ width: '56px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '44px' }} />
            <col style={{ width: '72px' }} />
          </colgroup>
          <thead>
            <tr>
              <td style={label()}>続柄</td>
              <td style={label()}>氏名</td>
              <td style={label()}>年齢</td>
              <td style={label()}>役職名</td>
              <td style={label()}>続柄</td>
              <td style={label()}>氏名</td>
              <td style={label()}>年齢</td>
              <td style={label()}>役職名</td>
            </tr>
          </thead>
          <tbody>
            {kelRows.length === 0 && (
              <tr><td colSpan={8} style={cell({ textAlign: 'center', color: '#999' })}>-</td></tr>
            )}
            {kelRows.map(([left, right], i) => (
              <tr key={i}>
                <td style={cell({ textAlign: 'center' })}>{hubunganToJapanese(left.hubungan)}</td>
                <td style={cell()}>{left.nama_anggota}</td>
                <td style={cell({ textAlign: 'center' })}>{left.umur ? `${left.umur} 歳` : '-'}</td>
                <td style={cell({ textAlign: 'center' })}>{left.pekerjaan}</td>
                {right ? (
                  <>
                    <td style={cell({ textAlign: 'center' })}>{hubunganToJapanese(right.hubungan)}</td>
                    <td style={cell()}>{right.nama_anggota}</td>
                    <td style={cell({ textAlign: 'center' })}>{right.umur ? `${right.umur} 歳` : '-'}</td>
                    <td style={cell({ textAlign: 'center' })}>{right.pekerjaan}</td>
                  </>
                ) : (
                  <>
                    <td style={cell()}></td><td style={cell()}></td><td style={cell()}></td><td style={cell()}></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}