import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

// GET /api/debug-data?no_peserta=JMS25001
// Tampilkan raw data dari DB untuk 1 siswa (admin only)
export async function GET(request: Request) {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  const url = new URL(request.url);
  const noPeserta = url.searchParams.get('no_peserta');

  if (!noPeserta) {
    // Tanpa param: list semua no_peserta yang ada
    const list = await query<{ no_peserta: string; nama_peserta: string; id_biodata: number }>(
      `SELECT id_biodata, no_peserta, nama_peserta FROM tbl_biodata ORDER BY id_biodata`
    );
    return NextResponse.json({ status: 200, list }, { status: 200 });
  }

  const biodata = await query<any>(
    `SELECT b.id_biodata, b.no_peserta, b.nama_peserta, b.foto, b.ktp, b.kk, b.akte_kelahiran, b.ijazah, b.hasil_mcu,
            im.golongan_darah, im.tinggi_badan
     FROM tbl_biodata b
     LEFT JOIN tbl_info_medis im ON im.id_biodata = b.id_biodata
     WHERE b.no_peserta = $1`,
    [noPeserta]
  );

  if (biodata.length === 0) {
    return NextResponse.json({ status: 404, message: 'Tidak ditemukan', no_peserta: noPeserta }, { status: 200 });
  }

  const id = biodata[0].id_biodata;

  const [pendidikan, pekerjaan, sertifikat, keluarga] = await Promise.all([
    query<any>(`SELECT * FROM tbl_riwayat_pendidikan WHERE id_biodata = $1`, [id]),
    query<any>(`SELECT * FROM tbl_riwayat_pekerjaan WHERE id_biodata = $1`, [id]),
    query<any>(`SELECT * FROM tbl_riwayat_sertifikat WHERE id_biodata = $1`, [id]),
    query<any>(`SELECT * FROM tbl_riwayat_keluarga WHERE id_biodata = $1`, [id]),
  ]);

  return NextResponse.json({
    status: 200,
    biodata: biodata[0],
    counts: {
      pendidikan: pendidikan.length,
      pekerjaan: pekerjaan.length,
      sertifikat: sertifikat.length,
      keluarga: keluarga.length,
    },
    keluarga,
    sertifikat,
    pendidikan,
  }, { status: 200 });
}
