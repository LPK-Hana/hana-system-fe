import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
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

    if (action === 'list') {
      const data = await query<any>(
        `SELECT id_master_job, job_title, deskripsi, tgl_deadline, tgl_mansetsu, kuota, created_at, updated_at
         FROM tbl_master_job
         ORDER BY id_master_job DESC`
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    if (action === 'list-assign-user') {
      const data = await query<any>(
        `SELECT jd.user_name, jd.nama_peserta, jd.angkatan, jd.id_master_job, mj.job_title, jd.updated_at
         FROM tbl_job_details jd
         INNER JOIN master_user mu ON mu.user_name = jd.user_name AND mu.is_active = 1 AND mu.is_admin = 0
         LEFT JOIN tbl_master_job mj ON jd.id_master_job = mj.id_master_job
         ORDER BY jd.user_name ASC`
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    if (action === 'last-edit') {
      const data = await query<any>(
        `SELECT user_name, COALESCE(DATE_PART('day', NOW() - updated_at)::int, 0) AS last_edit
         FROM tbl_job_details
         ORDER BY user_name ASC`
      );
      return NextResponse.json({ status: 200, data }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] job GET error:`, error.message);
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
    if (!auth || auth.is_admin !== 1) return NextResponse.json({ status: 403, message: 'Admin only' }, { status: 403 });

    const body = await request.json().catch(() => ({}));

    if (action === 'create') {
      const { job_title, deskripsi, tgl_deadline, tgl_mansetsu, kuota } = body;
      const res = await queryOne<any>(
        `INSERT INTO tbl_master_job (job_title, deskripsi, tgl_deadline, tgl_mansetsu, kuota)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_master_job`,
        [job_title, deskripsi || null, tgl_deadline || null, tgl_mansetsu || null, kuota || null]
      );
      return NextResponse.json({
        status: 200,
        message: 'Successfully create job',
        id_master_job: res?.id_master_job
      }, { status: 200 });
    }

    if (action === 'assign') {
      const { id_master_job, user_names } = body;
      if (!id_master_job) {
        return NextResponse.json({ status: 400, message: 'id_master_job required' }, { status: 400 });
      }

      // 1. Unassign all users currently assigned to this job
      await query(
        `UPDATE tbl_job_details SET id_master_job = NULL, updated_at = CURRENT_TIMESTAMP WHERE id_master_job = $1`,
        [id_master_job]
      );

      // 2. Assign selected users to this job
      if (Array.isArray(user_names) && user_names.length > 0) {
        for (const userName of user_names) {
          await query(
            `UPDATE tbl_job_details SET id_master_job = $1, updated_at = CURRENT_TIMESTAMP WHERE user_name = $2`,
            [id_master_job, userName]
          );
        }
      }

      return NextResponse.json({ status: 200, message: 'Successfully assign user' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] job POST error:`, error.message);
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
    if (!auth || auth.is_admin !== 1) return NextResponse.json({ status: 403, message: 'Admin only' }, { status: 403 });

    const body = await request.json().catch(() => ({}));

    if (action === 'update') {
      const { id_master_job, job_title, deskripsi, tgl_deadline, tgl_mansetsu, kuota } = body;
      await query(
        `UPDATE tbl_master_job
         SET job_title = $1, deskripsi = $2, tgl_deadline = $3, tgl_mansetsu = $4, kuota = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id_master_job = $6`,
        [job_title, deskripsi || null, tgl_deadline || null, tgl_mansetsu || null, kuota || null, id_master_job]
      );
      return NextResponse.json({ status: 200, message: 'Successfully update job' }, { status: 200 });
    }

    if (action === 'delete') {
      const { id_master_job } = body;
      if (!id_master_job) {
        return NextResponse.json({ status: 400, message: 'id_master_job required' }, { status: 400 });
      }

      // 1. Unassign all users assigned to this job
      await query(
        `UPDATE tbl_job_details SET id_master_job = NULL, updated_at = CURRENT_TIMESTAMP WHERE id_master_job = $1`,
        [id_master_job]
      );

      // 2. Delete the job
      await query(`DELETE FROM tbl_master_job WHERE id_master_job = $1`, [id_master_job]);

      return NextResponse.json({ status: 200, message: 'Successfully delete job' }, { status: 200 });
    }

    if (action === 'delete-assign') {
      const { user_name } = body;
      if (!user_name) {
        return NextResponse.json({ status: 400, message: 'user_name required' }, { status: 400 });
      }

      await query(
        `UPDATE tbl_job_details SET id_master_job = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_name = $1`,
        [user_name]
      );

      return NextResponse.json({ status: 200, message: 'Successfully delete assigned user' }, { status: 200 });
    }

    return NextResponse.json({ status: 404, message: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API] job PUT error:`, error.message);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
