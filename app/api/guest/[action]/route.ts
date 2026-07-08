import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requireAdmin, requireAuth, requireGuestOrAdmin } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;
    const auth = authResult.auth;

    if (action === 'list') {
      const adminResult = await requireAdmin();
      if (!adminResult.ok) return adminResult.response;
      
      const url = new URL(request.url);
      const isActiveParam = url.searchParams.get('is_active');
      const isActive = isActiveParam !== null ? Number(isActiveParam) : 1;

      const data = await query<any>(
        `SELECT guest_id, name, user_name, is_active, 
                COALESCE(TO_CHAR(createdt, 'DD Mon YYYY, HH24:MI'), '') as createdt, 
                COALESCE(TO_CHAR(updatedt, 'DD Mon YYYY, HH24:MI'), '') as updatedt, 
                COALESCE(created_by, '-') as created_by, 
                COALESCE(updated_by, '-') as updated_by
         FROM tbl_master_guest
         WHERE is_active = $1
         ORDER BY createdt DESC`,
        [isActive]
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    if (action === 'list-student') {
      const guestOrAdmin = await requireGuestOrAdmin();
      if (!guestOrAdmin.ok) return guestOrAdmin.response;

      const data = await query<any>(
        `SELECT 
            b.no_peserta, 
            b.nama_peserta, 
            COALESCE(b.nama_katakana, '') AS nama_katakana, 
            b.link_video, 
            b.skill,
            b.foto,
            CASE 
                WHEN n.bab_1 IS NOT NULL AND n.bab_2 IS NOT NULL AND n.bab_3 IS NOT NULL 
                     AND n.bab_4 IS NOT NULL AND n.bab_5 IS NOT NULL AND n.bab_6 IS NOT NULL 
                     AND n.bab_7 IS NOT NULL AND n.bab_8 IS NOT NULL AND n.bab_9 IS NOT NULL 
                     AND n.bab_10 IS NOT NULL AND n.bab_11 IS NOT NULL AND n.bab_12 IS NOT NULL 
                     AND n.bab_13 IS NOT NULL AND n.bab_14 IS NOT NULL AND n.bab_15 IS NOT NULL 
                THEN 1 
                ELSE 0 
            END AS finish_bab15
        FROM tbl_biodata b
        INNER JOIN master_user mu ON mu.user_name = b.no_peserta AND mu.is_active = 1 AND mu.is_admin = 0
        LEFT JOIN tbl_nilai n ON b.no_peserta = n.user_name AND n.id_aspek_nilai = 1`
      );

      const mappedData = data.map((item: any) => ({
        ...item,
        skill: Array.isArray(item.skill) ? item.skill : [],
      }));

      return NextResponse.json({
        status: 200,
        message: 'Berhasil mengambil data siswa',
        data: mappedData,
      }, { status: 200 });
    }

    if (action === 'list-qualification') {
      const guestOrAdmin = await requireGuestOrAdmin();
      if (!guestOrAdmin.ok) return guestOrAdmin.response;

      const url = new URL(request.url);
      const noPeserta = url.searchParams.get('no_peserta');
      if (!noPeserta) {
        return NextResponse.json({ status: 400, message: 'no_peserta is required' }, { status: 400 });
      }

      const result = await queryOne<any>(
        `SELECT link_video, skill 
         FROM tbl_biodata 
         WHERE no_peserta = $1`,
        [noPeserta]
      );

      if (!result) {
        return NextResponse.json({
          status: 200,
          message: 'Berhasil mengambil data kualifikasi',
          data: { link_video: null, skill: [] }
        }, { status: 200 });
      }

      return NextResponse.json({
        status: 200,
        message: 'Berhasil mengambil data kualifikasi',
        data: {
          link_video: result.link_video,
          skill: Array.isArray(result.skill) ? result.skill : []
        }
      }, { status: 200 });
    }

    if (action === 'list-resume') {
      const guestOrAdmin = await requireGuestOrAdmin();
      if (!guestOrAdmin.ok) return guestOrAdmin.response;

      const url = new URL(request.url);
      const noPeserta = url.searchParams.get('no_peserta');
      if (!noPeserta) {
        return NextResponse.json({ status: 400, message: 'no_peserta is required' }, { status: 400 });
      }

      const biodata = await queryOne<any>(
        `SELECT
          b.id_biodata,
          b.foto,
          b.no_peserta,
          b.angkatan,
          b.nik,
          b.nama_peserta,
          b.nama_panggilan,
          b.nama_katakana,
          b.tanggal_lahir,
          b.tgl_masuk_lpk,
          b.umur,
          b.jenis_kelamin,
          b.status_pernikahan,
          b.agama,
          b.negara_asal,
          b.alamat,
          b.nomor_telepon,
          b.email,
          b.kode_pos,
          b.akte_kelahiran,
          b.hasil_mcu,
          b.ijazah,
          b.kk,
          b.ktp,
          b.hobi,
          b.nama_perusahaan,
          b.bidang_pekerjaan,
          b.hasil_mcu_admin,
          b.perkiraan_masuk_jepang,
          b.tgl_keberangkatan,
          b.tanggal_kelulusan,
          im.tinggi_badan,
          im.berat_badan,
          im.mata_kiri,
          im.status_mata_kiri,
          im.mata_kanan,
          im.status_mata_kanan,
          im.merokok,
          im.frequensi_merokok,
          im.berkacamata,
          im.butawarna,
          im.golongan_darah,
          im.tato,
          im.riwayat_patah_tulang,
          k.nama_kelas
        FROM tbl_biodata b
        LEFT JOIN tbl_info_medis im ON im.id_biodata = b.id_biodata
        LEFT JOIN master_user mu ON mu.user_name = b.no_peserta
        LEFT JOIN tbl_kelas k ON k.id_kelas = mu.id_kelas
        WHERE b.no_peserta = $1
        LIMIT 1`,
        [noPeserta]
      );

      if (!biodata) {
        return NextResponse.json({ status: 200, data: null, message: 'CV belum tersedia' }, { status: 200 });
      }

      const [pendidikan, pekerjaan, sertifikat, keluarga] = await Promise.all([
        query<any>(
          `SELECT nama_sekolah, tingkat_pendidikan, jurusan, bulan_masuk, tahun_masuk, bulan_lulus, tahun_lulus
           FROM tbl_riwayat_pendidikan WHERE id_biodata = $1 ORDER BY id_riwayat_pendidikan`,
          [biodata.id_biodata]
        ),
        query<any>(
          `SELECT nama_perusahaan, posisi_pekerjaan, status_pekerjaan, bulan_mulai, tahun_mulai, bulan_selesai, tahun_selesai
           FROM tbl_riwayat_pekerjaan WHERE id_biodata = $1 ORDER BY id_riwayat_pekerjaan`,
          [biodata.id_biodata]
        ),
        query<any>(
          `SELECT nama_sertifikat, status_kelulusan, score, bulan_diperoleh, tahun_diperoleh, sertifikat
           FROM tbl_riwayat_sertifikat WHERE id_biodata = $1 ORDER BY id_riwayat_sertifikat`,
          [biodata.id_biodata]
        ),
        query<any>(
          `SELECT hubungan, nama, umur, status_pekerjaan
           FROM tbl_riwayat_keluarga WHERE id_biodata = $1 ORDER BY id_riwayat_keluarga`,
          [biodata.id_biodata]
        ),
      ]);

      return NextResponse.json({
        status: 200,
        message: 'success',
        data: {
          ...biodata,
          pendidikan: pendidikan || [],
          pekerjaan: pekerjaan || [],
          sertifikat: sertifikat || [],
          keluarga: keluarga || []
        }
      }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;
    const auth = authResult.auth;

    const body = await request.json().catch(() => ({}));

    if (action === 'create') {
      const adminResult = await requireAdmin();
      if (!adminResult.ok) return adminResult.response;
      
      const { name, user_name } = body;
      const password = body.password || body.user_password;
      if (!user_name || !password) {
        return NextResponse.json({ status: 400, message: 'username dan password wajib diisi' }, { status: 400 });
      }

      // Cek duplikasi username
      const existing = await queryOne(`SELECT guest_id FROM tbl_master_guest WHERE user_name = $1`, [user_name]);
      if (existing) {
        return NextResponse.json({ status: 400, message: 'Username sudah terdaftar' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        `INSERT INTO tbl_master_guest (name, user_name, password, is_active, created_by) 
         VALUES ($1, $2, $3, 1, $4)`,
        [name || user_name, user_name, hashedPassword, auth.user_name || null]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil membuat Guest' }, { status: 200 });
    }

    if (action === 'create-qualification') {
      const adminResult = await requireAdmin();
      if (!adminResult.ok) return adminResult.response;

      const { no_peserta, link_video, skill } = body;
      if (!no_peserta) {
        return NextResponse.json({ status: 400, message: 'no_peserta is required' }, { status: 400 });
      }

      await query(
        `UPDATE tbl_biodata 
         SET link_video = $1, skill = $2
         WHERE no_peserta = $3`,
        [link_video || null, Array.isArray(skill) ? skill : [], no_peserta]
      );

      return NextResponse.json({
        status: 201,
        message: 'Berhasil menyimpan data kualifikasi'
      }, { status: 201 });
    }

    return NextResponse.json({ status: 404, message: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const adminResult = await requireAdmin();
    if (!adminResult.ok) return adminResult.response;
    const auth = adminResult.auth;

    const body = await request.json().catch(() => ({}));
    const guestId = body.guest_id !== undefined ? body.guest_id : body.id_user;

    if (guestId === undefined) {
      return NextResponse.json({ status: 400, message: 'guest_id required' }, { status: 400 });
    }

    if (action === 'edit-status') {
      const is_active = body.is_active !== undefined ? Number(body.is_active) : 0;
      await query(
        `UPDATE tbl_master_guest 
         SET is_active = $1, updatedt = CURRENT_TIMESTAMP, updated_by = $2 
         WHERE guest_id = $3`,
        [is_active, auth.user_name || null, guestId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil update status' }, { status: 200 });
    }

    if (action === 'update-name') {
      const { name, user_name } = body;
      if (!name || !user_name) {
        return NextResponse.json({ status: 400, message: 'name and user_name required' }, { status: 400 });
      }

      // Cek duplikasi username
      const existing = await queryOne(
        `SELECT 1 FROM tbl_master_guest WHERE user_name = $1 AND guest_id != $2 LIMIT 1`,
        [user_name, guestId]
      );
      if (existing) {
        return NextResponse.json({ status: 400, message: 'Username sudah terdaftar' }, { status: 400 });
      }

      await query(
        `UPDATE tbl_master_guest 
         SET name = $1, user_name = $2, updatedt = CURRENT_TIMESTAMP, updated_by = $3 
         WHERE guest_id = $4`,
        [name, user_name, auth.user_name || null, guestId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil update nama' }, { status: 200 });
    }

    if (action === 'update-password') {
      const password = body.password || body.user_password;
      if (!password) {
        return NextResponse.json({ status: 400, message: 'password required' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        `UPDATE tbl_master_guest 
         SET password = $1, updatedt = CURRENT_TIMESTAMP, updated_by = $2 
         WHERE guest_id = $3`,
        [hashedPassword, auth.user_name || null, guestId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil update password' }, { status: 200 });
    }

    if (action === 'delete') {
      await query(
        `DELETE FROM tbl_master_guest 
         WHERE guest_id = $1`,
        [guestId]
      );
      return NextResponse.json({ status: 200, message: 'Berhasil hapus guest' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
