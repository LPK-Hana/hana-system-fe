import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { isStaff } from '@/lib/api-auth';
import { cookies } from 'next/headers';

async function getAuthRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const auth = await getAuthRole();
    if (!auth) return NextResponse.json({ status: 401, message: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    let targetUserName = url.searchParams.get('user_name');
    if (!isStaff(auth) || !targetUserName) {
      targetUserName = auth.user_name ?? null;
    }

    if (action === 'get-kk-id') {
      const master = await queryOne<any>(
        `SELECT * FROM tbl_master_kk_id WHERE user_name = $1 ORDER BY id_master_kk_id DESC LIMIT 1`,
        [targetUserName]
      );
      if (!master) return NextResponse.json({ status: 200, data: null }, { status: 200 });

      const details = await query<any>(
        `SELECT * FROM tbl_kk_details_id WHERE id_master_kk_id = $1 ORDER BY id_kk_details_id ASC`,
        [master.id_master_kk_id]
      );
      return NextResponse.json({ status: 200, data: { ...master, details } }, { status: 200 });
    }

    if (action === 'get-kk-jp') {
      const master = await queryOne<any>(
        `SELECT * FROM tbl_master_kk_jp WHERE user_name = $1 ORDER BY id_master_kk_jp DESC LIMIT 1`,
        [targetUserName]
      );
      if (!master) return NextResponse.json({ status: 200, data: null }, { status: 200 });

      const details = await query<any>(
        `SELECT * FROM tbl_kk_details_jp WHERE id_master_kk_jp = $1 ORDER BY id_kk_details_jp ASC`,
        [master.id_master_kk_jp]
      );
      return NextResponse.json({ status: 200, data: { ...master, details } }, { status: 200 });
    }

    if (action === 'check-kk') {
      const checkId = await queryOne<{ cnt: string }>(
        `SELECT COUNT(*)::int as cnt FROM tbl_master_kk_id WHERE user_name = $1`,
        [targetUserName]
      );
      const checkJp = await queryOne<{ cnt: string }>(
        `SELECT COUNT(*)::int as cnt FROM tbl_master_kk_jp WHERE user_name = $1`,
        [targetUserName]
      );
      return NextResponse.json({
        status: 200,
        data: {
          has_kk_id: Number(checkId?.cnt ?? 0) > 0,
          has_kk_jp: Number(checkJp?.cnt ?? 0) > 0,
          is_id_exist: Number(checkId?.cnt ?? 0) > 0,
          is_jp_exist: Number(checkJp?.cnt ?? 0) > 0
        }
      }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] input-kk GET error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const auth = await getAuthRole();
    if (!auth) return NextResponse.json({ status: 401, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    let targetUserName = body.user_name || auth.user_name;
    if (!isStaff(auth)) {
      targetUserName = auth.user_name ?? null;
    }

    if (action === 'create-kk-id') {
      const { details, ...masterData } = body;

      const master = await queryOne<{ id_master_kk_id: number }>(
        `INSERT INTO tbl_master_kk_id (user_name, nomor_kk, nama_kepala_keluarga, alamat, rt_rw, desa_kelurahan, kecamatan, kab_kota, kode_pos, provinsi, tgl_terbit, bln_terbit, thn_terbit, nama_kepala_dinas, nip_kadis)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id_master_kk_id`,
        [targetUserName, masterData.nomor_kk, masterData.nama_kepala_keluarga, masterData.alamat, masterData.rt_rw, masterData.desa_kelurahan, masterData.kecamatan, masterData.kab_kota, masterData.kode_pos, masterData.provinsi, masterData.tgl_terbit, masterData.bln_terbit, masterData.thn_terbit, masterData.nama_kepala_dinas, masterData.nip_kadis]
      );

      if (details && details.length > 0 && master) {
        for (const d of details) {
          await queryOne(
            `INSERT INTO tbl_kk_details_id (id_master_kk_id, nama_lengkap, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pendidikan, pekerjaan, status_perkawinan, hub_keluarga, kewarganegaraan, no_paspor, no_kitas_kitap, nama_ayah, nama_ibu, gol_darah)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [master.id_master_kk_id, d.nama_lengkap, d.nik, d.jenis_kelamin, d.tempat_lahir, d.tanggal_lahir || null, d.agama, d.pendidikan, d.pekerjaan, d.status_perkawinan, d.hub_keluarga, d.kewarganegaraan, d.no_paspor, d.no_kitas_kitap, d.nama_ayah, d.nama_ibu, d.gol_darah]
          );
        }
      }
      return NextResponse.json({ status: 200, message: 'Successfully create KK ID data' }, { status: 200 });
    }

    if (action === 'create-kk-jp') {
      const { details, ...masterData } = body;

      const master = await queryOne<{ id_master_kk_jp: number }>(
        `INSERT INTO tbl_master_kk_jp (user_name, nomor_kk, nama_kepala_keluarga, alamat, rt_rw, desa_kelurahan, kecamatan, kab_kota, kode_pos, provinsi, tgl_terbit, bln_terbit, thn_terbit, nama_kepala_dinas, nip_kadis)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id_master_kk_jp`,
        [targetUserName, masterData.nomor_kk, masterData.nama_kepala_keluarga, masterData.alamat, masterData.rt_rw, masterData.desa_kelurahan, masterData.kecamatan, masterData.kab_kota, masterData.kode_pos, masterData.provinsi, masterData.tgl_terbit, masterData.bln_terbit, masterData.thn_terbit, masterData.nama_kepala_dinas, masterData.nip_kadis]
      );

      if (details && details.length > 0 && master) {
        for (const d of details) {
          await queryOne(
            `INSERT INTO tbl_kk_details_jp (id_master_kk_jp, nama_lengkap, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pendidikan, pekerjaan, status_perkawinan, hub_keluarga, kewarganegaraan, no_paspor, no_kitas_kitap, nama_ayah, nama_ibu, gol_darah)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [master.id_master_kk_jp, d.nama_lengkap, d.nik, d.jenis_kelamin, d.tempat_lahir, d.tanggal_lahir || null, d.agama, d.pendidikan, d.pekerjaan, d.status_perkawinan, d.hub_keluarga, d.kewarganegaraan, d.no_paspor, d.no_kitas_kitap, d.nama_ayah, d.nama_ibu, d.gol_darah]
          );
        }
      }
      return NextResponse.json({ status: 200, message: 'Successfully create KK JP data' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] input-kk POST error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const auth = await getAuthRole();
    if (!auth) return NextResponse.json({ status: 401, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    let targetUserName = body.user_name || auth.user_name;
    if (!isStaff(auth)) {
      targetUserName = auth.user_name ?? null;
    }

    if (action === 'update-kk-id') {
      const { details, ...masterData } = body;
      const existing = await queryOne<{ id_master_kk_id: number }>(
        `SELECT id_master_kk_id FROM tbl_master_kk_id WHERE user_name = $1 ORDER BY id_master_kk_id DESC LIMIT 1`,
        [targetUserName]
      );
      if (!existing) return NextResponse.json({ status: 400, message: 'Data KK ID tidak ditemukan' }, { status: 400 });

      const idMaster = existing.id_master_kk_id;
      await queryOne(
        `UPDATE tbl_master_kk_id SET nomor_kk=$1, nama_kepala_keluarga=$2, alamat=$3, rt_rw=$4, desa_kelurahan=$5, kecamatan=$6, kab_kota=$7, kode_pos=$8, provinsi=$9, tgl_terbit=$10, bln_terbit=$11, thn_terbit=$12, nama_kepala_dinas=$13, nip_kadis=$14 WHERE id_master_kk_id=$15`,
        [masterData.nomor_kk, masterData.nama_kepala_keluarga, masterData.alamat, masterData.rt_rw, masterData.desa_kelurahan, masterData.kecamatan, masterData.kab_kota, masterData.kode_pos, masterData.provinsi, masterData.tgl_terbit, masterData.bln_terbit, masterData.thn_terbit, masterData.nama_kepala_dinas, masterData.nip_kadis, idMaster]
      );
      await queryOne(`DELETE FROM tbl_kk_details_id WHERE id_master_kk_id = $1`, [idMaster]);

      if (details && details.length > 0) {
        for (const d of details) {
          await queryOne(
            `INSERT INTO tbl_kk_details_id (id_master_kk_id, nama_lengkap, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pendidikan, pekerjaan, status_perkawinan, hub_keluarga, kewarganegaraan, no_paspor, no_kitas_kitap, nama_ayah, nama_ibu, gol_darah)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [idMaster, d.nama_lengkap, d.nik, d.jenis_kelamin, d.tempat_lahir, d.tanggal_lahir || null, d.agama, d.pendidikan, d.pekerjaan, d.status_perkawinan, d.hub_keluarga, d.kewarganegaraan, d.no_paspor, d.no_kitas_kitap, d.nama_ayah, d.nama_ibu, d.gol_darah]
          );
        }
      }
      return NextResponse.json({ status: 200, message: 'Successfully update KK ID data' }, { status: 200 });
    }

    if (action === 'update-kk-jp') {
      const { details, ...masterData } = body;
      const existing = await queryOne<{ id_master_kk_jp: number }>(
        `SELECT id_master_kk_jp FROM tbl_master_kk_jp WHERE user_name = $1 ORDER BY id_master_kk_jp DESC LIMIT 1`,
        [targetUserName]
      );
      if (!existing) return NextResponse.json({ status: 400, message: 'Data KK JP tidak ditemukan' }, { status: 400 });

      const idMaster = existing.id_master_kk_jp;
      await queryOne(
        `UPDATE tbl_master_kk_jp SET nomor_kk=$1, nama_kepala_keluarga=$2, alamat=$3, rt_rw=$4, desa_kelurahan=$5, kecamatan=$6, kab_kota=$7, kode_pos=$8, provinsi=$9, tgl_terbit=$10, bln_terbit=$11, thn_terbit=$12, nama_kepala_dinas=$13, nip_kadis=$14 WHERE id_master_kk_jp=$15`,
        [masterData.nomor_kk, masterData.nama_kepala_keluarga, masterData.alamat, masterData.rt_rw, masterData.desa_kelurahan, masterData.kecamatan, masterData.kab_kota, masterData.kode_pos, masterData.provinsi, masterData.tgl_terbit, masterData.bln_terbit, masterData.thn_terbit, masterData.nama_kepala_dinas, masterData.nip_kadis, idMaster]
      );
      await queryOne(`DELETE FROM tbl_kk_details_jp WHERE id_master_kk_jp = $1`, [idMaster]);

      if (details && details.length > 0) {
        for (const d of details) {
          await queryOne(
            `INSERT INTO tbl_kk_details_jp (id_master_kk_jp, nama_lengkap, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pendidikan, pekerjaan, status_perkawinan, hub_keluarga, kewarganegaraan, no_paspor, no_kitas_kitap, nama_ayah, nama_ibu, gol_darah)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [idMaster, d.nama_lengkap, d.nik, d.jenis_kelamin, d.tempat_lahir, d.tanggal_lahir || null, d.agama, d.pendidikan, d.pekerjaan, d.status_perkawinan, d.hub_keluarga, d.kewarganegaraan, d.no_paspor, d.no_kitas_kitap, d.nama_ayah, d.nama_ibu, d.gol_darah]
          );
        }
      }
      return NextResponse.json({ status: 200, message: 'Successfully update KK JP data' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] input-kk PUT error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
