import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireStaff } from '@/lib/api-auth';
import {
  ASPECT_TO_ID,
  aspectRevisionFromRow,
  emptyNilaiRevisions,
  kepribadianRevisionFromRow,
  MateriAspect,
  MATERI_ASPECTS,
  NilaiSaveScope,
  subNilaiRevision,
  type NilaiRevisions,
} from '@/lib/nilai-revision';

const CONFLICT_MESSAGE =
  'Data siswa ini baru saja diubah admin lain. Muat ulang data lalu simpan lagi.';

function parseVal(val: unknown) {
  return val === null || val === undefined || val === '' ? null : val;
}

function conflictResponse() {
  return NextResponse.json(
    { status: 409, message: CONFLICT_MESSAGE, conflict: true },
    { status: 409 },
  );
}

function assertRevision(expected: unknown, current: string) {
  if (typeof expected !== 'string' || !expected) return null;
  if (expected !== current) return conflictResponse();
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    if (action === 'list' || action === 'list-certificate') {
      const adminResult = await requireStaff();
      if (!adminResult.ok) return adminResult.response;
    }

    if (action === 'list') {
      const rawRows = await query<any>(
        `SELECT n.id_nilai, n.user_name, b.nama_peserta as name, b.foto,
                k.nama_kelas, n.id_aspek_nilai, a.aspek_penilaian,
                n.bab_1, n.bab_2, n.bab_3, n.bab_4, n.bab_5, n.bab_6, n.bab_7, n.bab_8, n.bab_9, n.bab_10,
                n.bab_11, n.bab_12, n.bab_13, n.bab_14, n.bab_15, n.bab_16, n.bab_17, n.bab_18, n.bab_19, n.bab_20,
                n.bab_21, n.bab_22, n.bab_23, n.bab_24, n.bab_25, n.bab_26, n.bab_27, n.bab_28, n.bab_29, n.bab_30,
                n.bab_31, n.bab_32, n.bab_33, n.bab_34, n.bab_35, n.bab_36, n.bab_37, n.bab_38, n.bab_39, n.bab_40,
                n.bab_41, n.bab_42, n.bab_43, n.bab_44, n.bab_45, n.bab_46, n.bab_47, n.bab_48, n.bab_49, n.bab_50,
                n.keterangan,
                sb.nilai_ujian_masuk, sb.nilai_n4, sb.nilai_n5, sb.catatan_sikap_siswa,
                kp.nilai_kedisiplinan, kp.nilai_kepribadian, kp.nilai_komunikasi, kp.nilai_kesopanan, kp.kontrol_emosi,
                kp.nilai_inisiatif, kp.nilai_percaya_diri
         FROM tbl_nilai n
         LEFT JOIN tbl_biodata b ON n.user_name = b.no_peserta
         LEFT JOIN master_user u ON b.no_peserta = u.user_name
         LEFT JOIN tbl_kelas k ON u.id_kelas = k.id_kelas
         LEFT JOIN tbl_aspek_nilai a ON n.id_aspek_nilai = a.id_aspek_nilai
         LEFT JOIN tbl_sub_nilai sb ON n.user_name = sb.user_name
         LEFT JOIN tbl_nilai_kepribadian kp ON n.user_name = kp.user_name
         WHERE u.is_active = 1 AND u.is_admin = 0`
      );

      const grouped: { [key: string]: any } = {};

      for (const d of rawRows) {
        if (!d.user_name) continue;
        const uname = d.user_name;

        if (!grouped[uname]) {
          grouped[uname] = {
            user_name: d.user_name,
            name: d.name,
            foto: d.foto,
            nama_kelas: d.nama_kelas,
            nilai_ujian_masuk: d.nilai_ujian_masuk,
            nilai_n4: d.nilai_n4,
            nilai_n5: d.nilai_n5,
            catatan_sikap_siswa: d.catatan_sikap_siswa,
            kepribadian: {
              kedisiplinan: d.nilai_kedisiplinan,
              kepribadian_diri: d.nilai_kepribadian,
              cara_komunikasi: d.nilai_komunikasi,
              kesopanan: d.nilai_kesopanan,
              kontrol_emosi: d.kontrol_emosi,
              inisiatif: d.nilai_inisiatif,
              percaya_diri: d.nilai_percaya_diri,
            },
            kotoba: null,
            bunpou: null,
            choukai: null,
            kaiwa: null,
            kanji: null,
            _aspectRows: {} as Record<string, any>,
            _subNilaiRow: {
              nilai_ujian_masuk: d.nilai_ujian_masuk,
              nilai_n4: d.nilai_n4,
              nilai_n5: d.nilai_n5,
              catatan_sikap_siswa: d.catatan_sikap_siswa,
            },
            _kepribadianRow: {
              nilai_kedisiplinan: d.nilai_kedisiplinan,
              nilai_kepribadian: d.nilai_kepribadian,
              nilai_komunikasi: d.nilai_komunikasi,
              nilai_kesopanan: d.nilai_kesopanan,
              kontrol_emosi: d.kontrol_emosi,
              nilai_inisiatif: d.nilai_inisiatif,
              nilai_percaya_diri: d.nilai_percaya_diri,
            },
          };
        }

        const userModel = grouped[uname];

        const babScores: { [key: string]: any } = {
          keterangan: d.keterangan,
        };
        for (let i = 1; i <= 50; i++) {
          babScores[`bab_${i}`] = d[`bab_${i}`];
        }

        if (d.aspek_penilaian) {
          const aspectKey = d.aspek_penilaian.toLowerCase() as MateriAspect;
          userModel[aspectKey] = babScores;
          if (MATERI_ASPECTS.includes(aspectKey)) {
            userModel._aspectRows[aspectKey] = d;
          }
        }
      }

      const data = Object.values(grouped).map((user) => {
        const revisions: NilaiRevisions = emptyNilaiRevisions();
        for (const aspect of MATERI_ASPECTS) {
          revisions.aspects[aspect] = aspectRevisionFromRow(user._aspectRows[aspect]);
        }
        revisions.sub_nilai = subNilaiRevision(user._subNilaiRow);
        revisions.kepribadian = kepribadianRevisionFromRow(user._kepribadianRow);

        const { _aspectRows, _subNilaiRow, _kepribadianRow, ...clean } = user;
        return { ...clean, revisions };
      });

      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    if (action === 'list-certificate') {
      const data = await query<any>(
        `SELECT u.user_name, b.nama_peserta as name, b.foto, k.nama_kelas, sb.nilai_n4, sb.nilai_n5
         FROM tbl_biodata b
         LEFT JOIN master_user u ON b.no_peserta = u.user_name
         LEFT JOIN tbl_kelas k ON u.id_kelas = k.id_kelas
         LEFT JOIN tbl_sub_nilai sb ON u.user_name = sb.user_name
         WHERE u.is_active = 1 AND u.is_admin = 0`
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] nilai GET error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const adminResult = await requireStaff();
    if (!adminResult.ok) return adminResult.response;

    const body = await request.json().catch(() => ({}));

    if (action === 'create') {
      const user_name = body.user_name as string;
      const saveScope = body.save_scope as NilaiSaveScope | undefined;
      const expectedRevision = body.expected_revision as string | undefined;

      if (!user_name || !saveScope) {
        return NextResponse.json(
          { status: 400, message: 'user_name dan save_scope wajib diisi' },
          { status: 400 },
        );
      }

      const updatedRevisions: Partial<NilaiRevisions> = { aspects: {} };

      if (saveScope === 'exams') {
        const current = await queryOne<any>(
          `SELECT nilai_ujian_masuk, nilai_n4, nilai_n5, catatan_sikap_siswa
           FROM tbl_sub_nilai WHERE user_name = $1`,
          [user_name],
        );
        const conflict = assertRevision(expectedRevision, subNilaiRevision(current));
        if (conflict) return conflict;

        const nUjianMasuk = parseVal(body.nilai_ujian_masuk);
        const nN4 = parseVal(body.nilai_n4);
        const nN5 = parseVal(body.nilai_n5);
        const catatanSikap = parseVal(body.catatan_sikap_siswa);

        await queryOne(
          `INSERT INTO tbl_sub_nilai (user_name, nilai_ujian_masuk, nilai_n4, nilai_n5, catatan_sikap_siswa)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (user_name) DO UPDATE SET
             nilai_ujian_masuk = EXCLUDED.nilai_ujian_masuk,
             nilai_n4 = EXCLUDED.nilai_n4,
             nilai_n5 = EXCLUDED.nilai_n5,
             catatan_sikap_siswa = EXCLUDED.catatan_sikap_siswa`,
          [user_name, nUjianMasuk, nN4, nN5, catatanSikap],
        );

        updatedRevisions.sub_nilai = subNilaiRevision({
          nilai_ujian_masuk: nUjianMasuk,
          nilai_n4: nN4,
          nilai_n5: nN5,
          catatan_sikap_siswa: catatanSikap,
        });
      } else if (saveScope === 'kepribadian') {
        const current = await queryOne<any>(
          `SELECT nilai_kedisiplinan, nilai_kepribadian, nilai_komunikasi, nilai_kesopanan,
                  kontrol_emosi, nilai_inisiatif, nilai_percaya_diri
           FROM tbl_nilai_kepribadian WHERE user_name = $1`,
          [user_name],
        );
        const conflict = assertRevision(expectedRevision, kepribadianRevisionFromRow(current));
        if (conflict) return conflict;

        const values = {
          nilai_kedisiplinan: parseVal(body.nilai_kedisiplinan),
          nilai_kepribadian: parseVal(body.nilai_kepribadian),
          nilai_komunikasi: parseVal(body.nilai_komunikasi),
          nilai_kesopanan: parseVal(body.nilai_kesopanan),
          kontrol_emosi: parseVal(body.kontrol_emosi),
          nilai_inisiatif: parseVal(body.nilai_inisiatif),
          nilai_percaya_diri: parseVal(body.nilai_percaya_diri),
        };

        await queryOne(
          `INSERT INTO tbl_nilai_kepribadian (
             user_name, nilai_kedisiplinan, nilai_kepribadian, nilai_komunikasi, nilai_kesopanan,
             kontrol_emosi, nilai_inisiatif, nilai_percaya_diri, keterangan
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (user_name) DO UPDATE SET
             nilai_kedisiplinan = EXCLUDED.nilai_kedisiplinan,
             nilai_kepribadian = EXCLUDED.nilai_kepribadian,
             nilai_komunikasi = EXCLUDED.nilai_komunikasi,
             nilai_kesopanan = EXCLUDED.nilai_kesopanan,
             kontrol_emosi = EXCLUDED.kontrol_emosi,
             nilai_inisiatif = EXCLUDED.nilai_inisiatif,
             nilai_percaya_diri = EXCLUDED.nilai_percaya_diri`,
          [
            user_name,
            values.nilai_kedisiplinan,
            values.nilai_kepribadian,
            values.nilai_komunikasi,
            values.nilai_kesopanan,
            values.kontrol_emosi,
            values.nilai_inisiatif,
            values.nilai_percaya_diri,
            null,
          ],
        );

        updatedRevisions.kepribadian = kepribadianRevisionFromRow(values);
      } else if (MATERI_ASPECTS.includes(saveScope as MateriAspect)) {
        const aspect = saveScope as MateriAspect;
        const id_aspek_nilai = ASPECT_TO_ID[aspect];
        const keterangan = parseVal(body.keterangan) as string | null;

        const babValues = Array.from({ length: 50 }, (_, i) => {
          const val = body[`bab_${i + 1}`];
          return val === null || val === undefined || val === '' ? null : val;
        });

        const current = await queryOne<any>(
          `SELECT bab_1, bab_2, bab_3, bab_4, bab_5, bab_6, bab_7, bab_8, bab_9, bab_10,
                  bab_11, bab_12, bab_13, bab_14, bab_15, bab_16, bab_17, bab_18, bab_19, bab_20,
                  bab_21, bab_22, bab_23, bab_24, bab_25, bab_26, bab_27, bab_28, bab_29, bab_30,
                  bab_31, bab_32, bab_33, bab_34, bab_35, bab_36, bab_37, bab_38, bab_39, bab_40,
                  bab_41, bab_42, bab_43, bab_44, bab_45, bab_46, bab_47, bab_48, bab_49, bab_50,
                  keterangan
           FROM tbl_nilai WHERE user_name = $1 AND id_aspek_nilai = $2`,
          [user_name, id_aspek_nilai],
        );
        const conflict = assertRevision(expectedRevision, aspectRevisionFromRow(current));
        if (conflict) return conflict;

        const existing = await queryOne<{ id_nilai: number }>(
          `SELECT id_nilai FROM tbl_nilai WHERE user_name = $1 AND id_aspek_nilai = $2`,
          [user_name, id_aspek_nilai],
        );

        const babSetCols = Array.from({ length: 50 }, (_, i) => `bab_${i + 1} = $${i + 1}`).join(', ');
        if (existing) {
          await queryOne(
            `UPDATE tbl_nilai SET ${babSetCols}, keterangan = $51 WHERE user_name = $52 AND id_aspek_nilai = $53`,
            [...babValues, keterangan, user_name, id_aspek_nilai],
          );
        } else {
          const babCols = Array.from({ length: 50 }, (_, i) => `bab_${i + 1}`).join(', ');
          const babPlaceholders = Array.from({ length: 50 }, (_, i) => `$${i + 1}`).join(', ');
          await queryOne(
            `INSERT INTO tbl_nilai (${babCols}, keterangan, user_name, id_aspek_nilai)
             VALUES (${babPlaceholders}, $51, $52, $53)`,
            [...babValues, keterangan, user_name, id_aspek_nilai],
          );
        }

        const aspectRow: Record<string, unknown> = { keterangan };
        babValues.forEach((val, idx) => {
          aspectRow[`bab_${idx + 1}`] = val;
        });
        updatedRevisions.aspects![aspect] = aspectRevisionFromRow(aspectRow);
      } else {
        return NextResponse.json({ status: 400, message: 'save_scope tidak valid' }, { status: 400 });
      }

      return NextResponse.json(
        {
          status: 200,
          message: 'Successfully update nilai',
          save_scope: saveScope,
          revisions: updatedRevisions,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] nilai POST error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
