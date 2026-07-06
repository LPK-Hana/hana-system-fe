import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { denyUnlessOwnerOrAdmin, isStaff, requireAuth, requireStaff } from '@/lib/api-auth';
import { cvRevisionFromApiRecord } from '@/lib/cv-revision';
import { isDemoMode } from '@/lib/demo-mode';
import { angkatanIntFromNoPeserta, DEMO_STUDENT_USERNAME } from '@/lib/nim';

/** Supabase/pg mengembalikan id_biodata sebagai string di JOIN, number di query langsung. */
function sameBiodataId(a: unknown, b: unknown): boolean {
  return Number(a) === Number(b);
}

const CV_CONFLICT_MESSAGE =
  'Profil siswa ini baru saja diubah admin lain. Muat ulang data lalu simpan lagi.';

async function loadCvRecordByNoPeserta(noPeserta: string) {
  const biodata = await queryOne<any>(
    `SELECT b.*,
      im.tinggi_badan, im.berat_badan,
      im.mata_kiri, im.status_mata_kiri,
      im.mata_kanan, im.status_mata_kanan,
      im.merokok, im.frequensi_merokok,
      im.berkacamata, im.butawarna,
      im.golongan_darah,
      im.tato, im.riwayat_patah_tulang
     FROM tbl_biodata b
     LEFT JOIN tbl_info_medis im ON im.id_biodata = b.id_biodata
     WHERE b.no_peserta = $1 LIMIT 1`,
    [noPeserta],
  );
  if (!biodata) return null;

  const [pendidikan, pekerjaan, sertifikat, keluarga] = await Promise.all([
    query<any>(`SELECT * FROM tbl_riwayat_pendidikan WHERE id_biodata = $1 ORDER BY id_riwayat_pendidikan`, [biodata.id_biodata]),
    query<any>(`SELECT * FROM tbl_riwayat_pekerjaan WHERE id_biodata = $1 ORDER BY id_riwayat_pekerjaan`, [biodata.id_biodata]),
    query<any>(`SELECT * FROM tbl_riwayat_sertifikat WHERE id_biodata = $1 ORDER BY id_riwayat_sertifikat`, [biodata.id_biodata]),
    query<any>(`SELECT * FROM tbl_riwayat_keluarga WHERE id_biodata = $1 ORDER BY id_riwayat_keluarga`, [biodata.id_biodata]),
  ]);

  return { ...biodata, pendidikan, pekerjaan, sertifikat, keluarga };
}

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
      const adminResult = await requireStaff();
      if (!adminResult.ok) return adminResult.response;

      const biodatas = await query<any>(
        `SELECT b.*,
          im.tinggi_badan, im.berat_badan,
          im.mata_kiri, im.status_mata_kiri,
          im.mata_kanan, im.status_mata_kanan,
          im.merokok, im.frequensi_merokok,
          im.berkacamata, im.butawarna,
          im.golongan_darah,
          im.tato, im.riwayat_patah_tulang
         FROM tbl_biodata b
         INNER JOIN master_user mu ON mu.user_name = b.no_peserta AND mu.is_active = 1 AND mu.is_admin = 0
         LEFT JOIN tbl_info_medis im ON im.id_biodata = b.id_biodata
         ORDER BY b.id_biodata`
      );

      if (biodatas.length === 0) {
        return NextResponse.json({ status: 200, data: [] }, { status: 200 });
      }

      const biodataIds = biodatas.map(b => b.id_biodata);
      // Gunakan parameterized IN query yang kompatibel dengan Supabase pooler
      const placeholders = biodataIds.map((_: any, i: number) => `$${i + 1}`).join(',');


      const [pendidikanAll, pekerjaanAll, sertifikatAll, keluargaAll] = await Promise.all([
        query<any>(`SELECT * FROM tbl_riwayat_pendidikan WHERE id_biodata IN (${placeholders}) ORDER BY id_riwayat_pendidikan`, biodataIds),
        query<any>(`SELECT * FROM tbl_riwayat_pekerjaan WHERE id_biodata IN (${placeholders}) ORDER BY id_riwayat_pekerjaan`, biodataIds),
        query<any>(`SELECT * FROM tbl_riwayat_sertifikat WHERE id_biodata IN (${placeholders}) ORDER BY id_riwayat_sertifikat`, biodataIds),
        query<any>(`SELECT * FROM tbl_riwayat_keluarga WHERE id_biodata IN (${placeholders}) ORDER BY id_riwayat_keluarga`, biodataIds),
      ]);

      const results = biodatas.map(bio => {
        const item = {
          ...bio,
          pendidikan: pendidikanAll.filter(p => sameBiodataId(p.id_biodata, bio.id_biodata)),
          pekerjaan: pekerjaanAll.filter(p => sameBiodataId(p.id_biodata, bio.id_biodata)),
          sertifikat: sertifikatAll.filter(s => sameBiodataId(s.id_biodata, bio.id_biodata)),
          keluarga: keluargaAll.filter(k => sameBiodataId(k.id_biodata, bio.id_biodata)),
        };
        return { ...item, cv_revision: cvRevisionFromApiRecord(item) };
      });

      return NextResponse.json({ status: 200, data: results }, { status: 200 });
    }

    if (action === 'list-user') {
      if (
        isDemoMode() &&
        auth.user_name?.toUpperCase() === DEMO_STUDENT_USERNAME
      ) {
        return NextResponse.json({ status: 200, data: null }, { status: 200 });
      }

      const biodata = await queryOne<any>(
        `SELECT b.*,
          im.tinggi_badan, im.berat_badan,
          im.mata_kiri, im.status_mata_kiri,
          im.mata_kanan, im.status_mata_kanan,
          im.merokok, im.frequensi_merokok,
          im.berkacamata, im.butawarna,
          im.golongan_darah,
          im.tato, im.riwayat_patah_tulang,
          k.nama_kelas
         FROM tbl_biodata b
         LEFT JOIN tbl_info_medis im ON im.id_biodata = b.id_biodata
         LEFT JOIN master_user mu ON mu.user_name = b.no_peserta
         LEFT JOIN tbl_kelas k ON k.id_kelas = mu.id_kelas
         WHERE b.no_peserta = $1 LIMIT 1`,
        [auth.user_name]
      );

      if (!biodata) return NextResponse.json({ status: 200, data: null }, { status: 200 });

      const [pendidikan, pekerjaan, sertifikat, keluarga] = await Promise.all([
        query<any>(`SELECT * FROM tbl_riwayat_pendidikan WHERE id_biodata = $1 ORDER BY id_riwayat_pendidikan`, [biodata.id_biodata]),
        query<any>(`SELECT * FROM tbl_riwayat_pekerjaan WHERE id_biodata = $1 ORDER BY id_riwayat_pekerjaan`, [biodata.id_biodata]),
        query<any>(`SELECT * FROM tbl_riwayat_sertifikat WHERE id_biodata = $1 ORDER BY id_riwayat_sertifikat`, [biodata.id_biodata]),
        query<any>(`SELECT * FROM tbl_riwayat_keluarga WHERE id_biodata = $1 ORDER BY id_riwayat_keluarga`, [biodata.id_biodata]),
      ]);

      return NextResponse.json({ status: 200, data: { ...biodata, pendidikan, pekerjaan, sertifikat, keluarga } }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] resume GET error:`, error.message, error.stack);
    return NextResponse.json({ status: 500, message: error.message, detail: error.stack?.split('\n').slice(0,3).join(' | ') }, { status: 500 });
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

    const formData = await request.formData();
    const dataStr = formData.get('data') as string;
    if (!dataStr) return NextResponse.json({ status: 400, message: 'Missing JSON data payload' }, { status: 400 });

    const payload = JSON.parse(dataStr);

    if (action === 'create' || action === 'edit') {
      const noPesertaCheck = (payload.no_peserta || '').toUpperCase().trim();
      if (!isStaff(auth)) {
        const denied = denyUnlessOwnerOrAdmin(auth, noPesertaCheck);
        if (denied) return denied;
      }

      // Cek duplikat
      if (action === 'create') {
        const existing = await queryOne(`SELECT id_biodata FROM tbl_biodata WHERE no_peserta = $1`, [payload.no_peserta]);
        if (existing) {
          return NextResponse.json({ status: 400, message: 'CV untuk nomor peserta ini sudah ada. Satu nomor peserta hanya boleh mengunggah CV satu kali.' }, { status: 400 });
        }
      }

      // Cek duplikat NIK
      if (payload.nik) {
        const existingNik = await queryOne<any>(
          `SELECT no_peserta FROM tbl_biodata WHERE nik = $1 AND no_peserta <> $2 LIMIT 1`,
          [payload.nik.trim(), payload.no_peserta]
        );
        if (existingNik) {
          return NextResponse.json({
            status: 400,
            message: `NIK sudah terdaftar oleh siswa lain (${existingNik.no_peserta})`
          }, { status: 400 });
        }
      }

      if (action === 'edit' && payload.expected_cv_revision) {
        const current = await loadCvRecordByNoPeserta(payload.no_peserta);
        if (!current) {
          return NextResponse.json({ status: 400, message: 'CV tidak ditemukan untuk diedit' }, { status: 400 });
        }
        const currentRev = cvRevisionFromApiRecord(current);
        if (currentRev !== payload.expected_cv_revision) {
          return NextResponse.json(
            { status: 409, message: CV_CONFLICT_MESSAGE, conflict: true },
            { status: 409 },
          );
        }
      }

      // Handle file uploads — penamaan: Photo3x4_JMS05001.webp, KTP_JMS05001.webp, dll.
      const { processAndSaveFile } = await import('@/lib/uploadHelper');
      const { buildUploadBasename, sanitizeNoPesertaForFilename } = await import('@/lib/upload-filename');

      const noSlug = sanitizeNoPesertaForFilename(payload.no_peserta || '');
      const hasNewUpload = [
        'foto_file', 'ktp_file', 'kk_file', 'akte_kelahiran_file',
        'ijazah_terakhir_file', 'ijazah_file', 'hasil_mcu_file', 'berkas_sertifikat_file',
      ].some((key) => {
        const f = formData.get(key) as File | null;
        return f && f.size > 0;
      }) || Array.from(formData.keys()).some((k) => k.startsWith('sertifikat_file_'));

      if (hasNewUpload && !noSlug) {
        return NextResponse.json({
          status: 400,
          message: 'no_peserta wajib diisi agar file upload dapat dinamai dengan benar.',
        }, { status: 400 });
      }

      const filesToProcess = [
        { key: 'foto_file', prop: 'foto', folder: 'foto' as const },
        { key: 'ktp_file', prop: 'ktp', folder: 'ktp' as const },
        { key: 'kk_file', prop: 'kk', folder: 'kk' as const },
        { key: 'akte_kelahiran_file', prop: 'akte_kelahiran', folder: 'akte_kelahiran' as const },
        { key: 'ijazah_terakhir_file', prop: 'ijazah', folder: 'ijazah' as const },
        { key: 'ijazah_file', prop: 'ijazah', folder: 'ijazah' as const },
        { key: 'hasil_mcu_file', prop: 'hasil_mcu', folder: 'hasil_mcu' as const },
      ];

      for (const f of filesToProcess) {
        const fileObj = formData.get(f.key) as File;
        if (fileObj && fileObj.size > 0) {
          const basename = buildUploadBasename(f.folder, noSlug);
          payload[f.prop] = await processAndSaveFile(fileObj, f.folder, basename);
        }
      }

      const sertifikatFile = formData.get('berkas_sertifikat_file') as File;
      if (sertifikatFile && sertifikatFile.size > 0 && payload.sertifikat?.length > 0) {
        const certName = payload.sertifikat[0].nama_sertifikat || 'sertifikat';
        const basename = buildUploadBasename('sertifikat', noSlug, { index: 0, label: certName });
        payload.sertifikat[0].sertifikat = await processAndSaveFile(sertifikatFile, 'sertifikat', basename);
      }

      if (payload.sertifikat?.length > 0) {
        for (let i = 0; i < payload.sertifikat.length; i++) {
          const formKey = `sertifikat_file_${i}`;
          const fileObj = formData.get(formKey) as File;
          if (fileObj && fileObj.size > 0) {
            const certName = payload.sertifikat[i].nama_sertifikat || `cert_${i}`;
            const basename = buildUploadBasename('sertifikat', noSlug, { index: i, label: certName });
            payload.sertifikat[i].sertifikat = await processAndSaveFile(fileObj, 'sertifikat', basename);
          }
        }
      }

      const angkatan = angkatanIntFromNoPeserta(payload.no_peserta || '');

      let idBiodata: number;

      if (action === 'create') {
        const res = await queryOne<{ id_biodata: number }>(
          `INSERT INTO tbl_biodata (foto, no_peserta, angkatan, nik, nama_peserta, nama_panggilan, nama_katakana, tanggal_lahir, tgl_masuk_lpk, umur, jenis_kelamin, status_pernikahan, agama, negara_asal, alamat, nomor_telepon, email, kode_pos, hobi, akte_kelahiran, hasil_mcu, ijazah, kk, ktp, hasil_mcu_admin, perkiraan_masuk_jepang, tgl_keberangkatan, tanggal_kelulusan)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) RETURNING id_biodata`,
          [payload.foto, payload.no_peserta, angkatan, payload.nik, payload.nama_peserta, payload.nama_panggilan, payload.nama_katakana, payload.tanggal_lahir, payload.tgl_masuk_lpk, payload.umur, payload.jenis_kelamin, payload.status_pernikahan, payload.agama, payload.negara_asal, payload.alamat, payload.nomor_telepon, payload.email, payload.kode_pos, payload.hobi, payload.akte_kelahiran, payload.hasil_mcu, payload.ijazah, payload.kk, payload.ktp, payload.hasil_mcu_admin, payload.perkiraan_masuk_jepang || null, payload.tgl_keberangkatan || null, payload.tanggal_kelulusan || null]
        );
        if (!res) throw new Error('Gagal insert biodata');
        idBiodata = res.id_biodata;
      } else {
        const existing = await queryOne<{ id_biodata: number }>(`SELECT id_biodata FROM tbl_biodata WHERE no_peserta = $1`, [payload.no_peserta]);
        if (!existing) return NextResponse.json({ status: 400, message: 'CV tidak ditemukan untuk diedit' }, { status: 400 });
        idBiodata = existing.id_biodata;
        await queryOne(
          `UPDATE tbl_biodata SET foto=$1, angkatan=$2, nik=$3, nama_peserta=$4, nama_panggilan=$5, nama_katakana=$6, tanggal_lahir=$7, tgl_masuk_lpk=$8, umur=$9, jenis_kelamin=$10, status_pernikahan=$11, agama=$12, negara_asal=$13, alamat=$14, nomor_telepon=$15, email=$16, kode_pos=$17, hobi=$18, akte_kelahiran=$19, hasil_mcu=$20, ijazah=$21, kk=$22, ktp=$23, hasil_mcu_admin=$24, perkiraan_masuk_jepang=$25, tgl_keberangkatan=$26, tanggal_kelulusan=$27 WHERE id_biodata=$28`,
          [payload.foto, angkatan, payload.nik, payload.nama_peserta, payload.nama_panggilan, payload.nama_katakana, payload.tanggal_lahir, payload.tgl_masuk_lpk, payload.umur, payload.jenis_kelamin, payload.status_pernikahan, payload.agama, payload.negara_asal, payload.alamat, payload.nomor_telepon, payload.email, payload.kode_pos, payload.hobi, payload.akte_kelahiran, payload.hasil_mcu, payload.ijazah, payload.kk, payload.ktp, payload.hasil_mcu_admin, payload.perkiraan_masuk_jepang || null, payload.tgl_keberangkatan || null, payload.tanggal_kelulusan || null, idBiodata]
        );
        // Hapus riwayat lama
        await queryOne(`DELETE FROM tbl_info_medis WHERE id_biodata = $1`, [idBiodata]);
        await queryOne(`DELETE FROM tbl_riwayat_pendidikan WHERE id_biodata = $1`, [idBiodata]);
        await queryOne(`DELETE FROM tbl_riwayat_pekerjaan WHERE id_biodata = $1`, [idBiodata]);
        await queryOne(`DELETE FROM tbl_riwayat_sertifikat WHERE id_biodata = $1`, [idBiodata]);
        await queryOne(`DELETE FROM tbl_riwayat_keluarga WHERE id_biodata = $1`, [idBiodata]);
      }

      // Insert info_medis
      await queryOne(
        `INSERT INTO tbl_info_medis (tinggi_badan, berat_badan, mata_kiri, status_mata_kiri, mata_kanan, status_mata_kanan, merokok, frequensi_merokok, berkacamata, butawarna, golongan_darah, tato, riwayat_patah_tulang, id_biodata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [payload.tinggi_badan, payload.berat_badan, payload.mata_kiri, payload.status_mata_kiri, payload.mata_kanan, payload.status_mata_kanan, payload.merokok, payload.frequensi_merokok, payload.berkacamata, payload.butawarna, payload.golongan_darah, payload.tato, payload.riwayat_patah_tulang, idBiodata]
      );

      if (payload.pendidikan?.length > 0) {
        for (const p of payload.pendidikan) {
          await queryOne(`INSERT INTO tbl_riwayat_pendidikan (nama_sekolah, tingkat_pendidikan, jurusan, bulan_masuk, tahun_masuk, bulan_lulus, tahun_lulus, id_biodata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [p.nama_sekolah, p.tingkat_pendidikan, p.jurusan, p.bulan_masuk, p.tahun_masuk, p.bulan_lulus, p.tahun_lulus, idBiodata]);
        }
      }
      if (payload.pekerjaan?.length > 0) {
        for (const p of payload.pekerjaan) {
          await queryOne(`INSERT INTO tbl_riwayat_pekerjaan (nama_perusahaan, posisi_pekerjaan, status_pekerjaan, bulan_mulai, tahun_mulai, bulan_selesai, tahun_selesai, id_biodata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [p.nama_perusahaan, p.posisi_pekerjaan, p.status_pekerjaan, p.bulan_mulai, p.tahun_mulai, p.bulan_selesai, p.tahun_selesai, idBiodata]);
        }
      }
      if (payload.sertifikat?.length > 0) {
        for (const s of payload.sertifikat) {
          await queryOne(`INSERT INTO tbl_riwayat_sertifikat (nama_sertifikat, status_kelulusan, score, bulan_diperoleh, tahun_diperoleh, sertifikat, id_biodata) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [s.nama_sertifikat, s.status_kelulusan, s.score, s.bulan_diperoleh, s.tahun_diperoleh, s.sertifikat, idBiodata]);
        }
      }
      if (payload.keluarga?.length > 0) {
        for (const k of payload.keluarga) {
          await queryOne(`INSERT INTO tbl_riwayat_keluarga (hubungan, nama, umur, status_pekerjaan, id_biodata) VALUES ($1,$2,$3,$4,$5)`,
            [k.hubungan, k.nama, k.umur, k.status_pekerjaan, idBiodata]);
        }
      }

      return NextResponse.json({ status: 200, message: `Successfully ${action} cv data` }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] resume POST error:`, error.message);
    const msg = error.message || '';
    if (msg.includes('tbl_biodata_nik_key') || (msg.includes('duplicate key') && msg.includes('nik'))) {
      return NextResponse.json({ status: 400, message: 'NIK sudah terdaftar' }, { status: 400 });
    }
    if (msg.includes('tbl_biodata_no_peserta_key') || (msg.includes('duplicate key') && msg.includes('no_peserta'))) {
      return NextResponse.json({
        status: 400,
        message: 'CV untuk nomor peserta ini sudah ada. Satu nomor peserta hanya boleh mengunggah CV satu kali.'
      }, { status: 400 });
    }
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
