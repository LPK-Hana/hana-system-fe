'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Plus, Users, LayoutList } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ApiResume from '@/app/api/resume/api_resume';
import ApiJob from '@/app/api/job/api_job';
import LoadingOverlay from '@/components/LoadingOverlay';

import AddJobModal from './components/AddJobModal';
import AssignStudentModal from './components/AssignStudentModal';
import ViewAssignedStudentsModal from './components/ViewAssignedStudentsModal';
import JobDescriptionModal from './components/JobDescriptionModal';
import EditJobModal from './components/EditJobModal';
import DeleteJobModal from './components/DeleteJobModal';

interface StudentData {
  no_peserta: string;
  nama_lengkap: string;
  angkatan: string;
  job_title?: string | null;
  id_master_job?: number | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  deadlineDokumen: string;
  tanggalMansetsu: string;
  status: string;
  kuota: number | null;
  assignedStudents: string[]; // array of no_peserta
  createdAt: string;
}

const calculateJobStatus = (deadline: string, mansetsu: string): string => {
  if (!deadline || !mansetsu) return 'Waiting';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const mansetsuDate = new Date(mansetsu);
  mansetsuDate.setHours(0, 0, 0, 0);

  if (today < deadlineDate) {
    return 'Waiting';
  } else if (today.getTime() === deadlineDate.getTime()) {
    return 'Submission Day';
  } else if (today > deadlineDate && today < mansetsuDate) {
    return 'Ongoing';
  } else if (today.getTime() === mansetsuDate.getTime()) {
    return 'Mansetsu Day';
  } else {
    return 'Closed';
  }
};

export default function JobManagementPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'aktif' | 'nonaktif'>('aktif');
  const [assignModalData, setAssignModalData] = useState<{ isOpen: boolean; jobId: string | null }>({
    isOpen: false,
    jobId: null,
  });
  const [viewModalData, setViewModalData] = useState<{ isOpen: boolean; jobId: string | null }>({
    isOpen: false,
    jobId: null,
  });
  const [descriptionModalData, setDescriptionModalData] = useState<{ isOpen: boolean; title: string; description: string }>({
    isOpen: false,
    title: '',
    description: '',
  });

  const [editModalData, setEditModalData] = useState<{ isOpen: boolean; job: Job | null }>({
    isOpen: false,
    job: null,
  });

  const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean; jobId: string | null }>({
    isOpen: false,
    jobId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [resStudents, resJobs, resLastEdit] = await Promise.all([
          ApiJob().GetAssignUserData(),
          ApiJob().GetDataJob(),
          ApiJob().GetLastEdit(),
        ]);

        let mappedStudents: StudentData[] = [];
        if (resStudents?.status === 200 && resStudents?.data) {
          mappedStudents = resStudents.data.map((user: any) => ({
            no_peserta: user.user_name || '-',
            nama_lengkap: user.nama_peserta || '-',
            angkatan: user.angkatan ? `Angkatan ${user.angkatan}` : '-',
            job_title: user.job_title || null,
            id_master_job: user.id_master_job || null,
          }));
          setStudents(mappedStudents);
        } else {
          toast.error('Gagal memuat data profil siswa');
        }

        let mappedJobs: Job[] = [];
        if (resJobs?.status === 200 && resJobs?.data) {
          mappedJobs = resJobs.data.map((job: any) => ({
            id: job.id_master_job?.toString(),
            title: job.job_title || '-',
            description: job.deskripsi || '',
            deadlineDokumen: job.tgl_deadline || '',
            tanggalMansetsu: job.tgl_mansetsu || '',
            status: calculateJobStatus(job.tgl_deadline, job.tgl_mansetsu),
            kuota: job.kuota != null ? job.kuota : null,
            assignedStudents: [],
            createdAt: job.created_at || new Date().toISOString(),
          }));
          setJobs(mappedJobs);
        }

        // Auto-unassign logic: if a job is 30+ days past both deadline & mansetsu,
        // and the student's last_edit is also 30+ days, unassign them automatically
        if (resLastEdit?.status === 200 && resLastEdit?.data) {
          const lastEditMap: Record<string, number> = {};
          resLastEdit.data.forEach((item: any) => {
            lastEditMap[item.user_name] = item.last_edit;
          });

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const usersToUnassign: string[] = [];

          for (const job of mappedJobs) {
            if (!job.deadlineDokumen || !job.tanggalMansetsu) continue;

            const deadlineDate = new Date(job.deadlineDokumen);
            deadlineDate.setHours(0, 0, 0, 0);
            const mansetsuDate = new Date(job.tanggalMansetsu);
            mansetsuDate.setHours(0, 0, 0, 0);

            const daysPastDeadline = Math.floor((today.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysPastMansetsu = Math.floor((today.getTime() - mansetsuDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysPastDeadline >= 30 && daysPastMansetsu >= 30) {
              // Find students assigned to this job
              const assignedStudents = mappedStudents.filter(s => s.id_master_job === Number(job.id));
              for (const student of assignedStudents) {
                const lastEdit = lastEditMap[student.no_peserta];
                if (lastEdit !== undefined && lastEdit >= 30) {
                  usersToUnassign.push(student.no_peserta);
                }
              }
            }
          }

          // Execute auto-unassign
          if (usersToUnassign.length > 0) {
            for (const userName of usersToUnassign) {
              await ApiJob().PutDeleteAssignedUser({ user_name: userName });
            }
            toast.success(`Auto-unassign: ${usersToUnassign.length} siswa berhasil di-unassign karena sudah melewati 30 hari.`);

            // Refresh student list after auto-unassign
            const refreshed = await ApiJob().GetAssignUserData();
            if (refreshed?.status === 200 && refreshed?.data) {
              const refreshedData: StudentData[] = refreshed.data.map((user: any) => ({
                no_peserta: user.user_name || '-',
                nama_lengkap: user.nama_peserta || '-',
                angkatan: user.angkatan ? `Angkatan ${user.angkatan}` : '-',
                job_title: user.job_title || null,
                id_master_job: user.id_master_job || null,
              }));
              setStudents(refreshedData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data dari server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddJob = async (jobData: { title: string; description: string; deadlineDokumen: string; tanggalMansetsu: string; kuota: number | null }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        job_title: jobData.title,
        deskripsi: jobData.description || null,
        tgl_deadline: jobData.deadlineDokumen || null,
        tgl_mansetsu: jobData.tanggalMansetsu || null,
        kuota: jobData.kuota,
      };

      const res = await ApiJob().PostCreateJob(payload);

      if (res?.status === 201 || res?.status === 200) {
        const newJob: Job = {
          ...jobData,
          status: calculateJobStatus(jobData.deadlineDokumen, jobData.tanggalMansetsu),
          id: res.id_master_job?.toString() || Math.random().toString(36).substr(2, 9),
          assignedStudents: [],
          createdAt: new Date().toISOString(),
        };
        setJobs((prev) => [newJob, ...prev]);
        setIsAddModalOpen(false);
        toast.success('Job berhasil ditambahkan!');
      } else {
        toast.error(res?.message || 'Gagal menambahkan Job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJob = async (jobData: { id: string; title: string; description: string; deadlineDokumen: string; tanggalMansetsu: string; kuota: number | null }) => {
    setIsSubmitting(true);
    try {
      const parsedId = parseInt(jobData.id, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        toast.error('ID Job tidak valid. Silakan refresh halaman dan coba lagi.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        id_master_job: parsedId,
        job_title: jobData.title,
        deskripsi: jobData.description || null,
        tgl_deadline: jobData.deadlineDokumen || null,
        tgl_mansetsu: jobData.tanggalMansetsu || null,
        kuota: jobData.kuota,
      };

      const res = await ApiJob().PutUpdateJob(payload);

      if (res?.status === 200) {
        setJobs((prev) => prev.map((j) => {
          if (j.id === jobData.id) {
            return {
              ...j,
              ...jobData,
              status: calculateJobStatus(jobData.deadlineDokumen, jobData.tanggalMansetsu),
            };
          }
          return j;
        }));
        setEditModalData({ isOpen: false, job: null });
        toast.success('Job berhasil diupdate!');
      } else {
        toast.error(res?.message || 'Gagal mengupdate Job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalData.jobId) return;
    const jobId = deleteModalData.jobId;

    setIsSubmitting(true);
    try {
      const parsedId = parseInt(jobId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        toast.error('ID Job tidak valid.');
        setIsSubmitting(false);
        return;
      }

      const res = await ApiJob().PutDeleteJob({ id_master_job: parsedId });

      if (res?.status === 200) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        toast.success('Job berhasil dihapus!');
        setDeleteModalData({ isOpen: false, jobId: null });

        // Refresh student list in case there were students unassigned by this action
        const resStudents = await ApiJob().GetAssignUserData();
        if (resStudents?.status === 200 && resStudents?.data) {
          const mappedData: StudentData[] = resStudents.data.map((user: any) => ({
            no_peserta: user.user_name || '-',
            nama_lengkap: user.nama_peserta || '-',
            angkatan: user.angkatan ? `Angkatan ${user.angkatan}` : '-',
            job_title: user.job_title || null,
            id_master_job: user.id_master_job || null,
          }));
          setStudents(mappedData);
        }
      } else {
        toast.error(res?.message || 'Gagal menghapus Job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAssignModal = (jobId: string) => {
    setAssignModalData({ isOpen: true, jobId });
  };

  const handleSaveAssignments = async (selectedStudentIds: string[]) => {
    if (!assignModalData.jobId) return;

    try {
      setIsSubmitting(true);
      const res = await ApiJob().PostAssignUser({
        id_master_job: parseInt(assignModalData.jobId),
        user_names: selectedStudentIds,
      });

      if (res?.status === 200) {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === assignModalData.jobId
              ? { ...job, assignedStudents: selectedStudentIds }
              : job
          )
        );
        setAssignModalData({ isOpen: false, jobId: null });
        toast.success('Siswa berhasil di-assign ke job!');

        // Refresh student list to update their status assignment
        const resStudents = await ApiJob().GetAssignUserData();
        if (resStudents?.status === 200 && resStudents?.data) {
          const mappedData: StudentData[] = resStudents.data.map((user: any) => ({
            no_peserta: user.user_name || '-',
            nama_lengkap: user.nama_peserta || '-',
            angkatan: user.angkatan ? `Angkatan ${user.angkatan}` : '-',
            job_title: user.job_title || null,
            id_master_job: user.id_master_job || null,
          }));
          setStudents(mappedData);
        }
      } else {
        toast.error(res?.message || 'Gagal menyimpan assignment');
      }
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast.error('Terjadi kesalahan saat menyimpan assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenViewModal = (jobId: string) => {
    setViewModalData({ isOpen: true, jobId });
  };

  const handleUnassignUser = async (userName: string) => {
    try {
      setIsSubmitting(true);
      const res = await ApiJob().PutDeleteAssignedUser({ user_name: userName });
      if (res?.status === 200) {
        toast.success('Berhasil menghapus assignment siswa');
        // Refresh student list
        const resStudents = await ApiJob().GetAssignUserData();
        if (resStudents?.status === 200 && resStudents?.data) {
          const mappedData: StudentData[] = resStudents.data.map((user: any) => ({
            no_peserta: user.user_name || '-',
            nama_lengkap: user.nama_peserta || '-',
            angkatan: user.angkatan ? `Angkatan ${user.angkatan}` : '-',
            job_title: user.job_title || null,
            id_master_job: user.id_master_job || null,
          }));
          setStudents(mappedData);
        }
      } else {
        toast.error(res?.message || 'Gagal menghapus assignment');
      }
    } catch (error) {
      console.error('Error unassigning user:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedJobForAssignment = jobs.find((j) => j.id === assignModalData.jobId);
  const selectedJobForView = jobs.find((j) => j.id === viewModalData.jobId);

  // Filter jobs based on Tanggal Mansetsu
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeJobs = jobs.filter((job) => {
    if (!job.tanggalMansetsu) return true; // if no mansetsu date, assume active
    const mansetsuDate = new Date(job.tanggalMansetsu);
    mansetsuDate.setHours(0, 0, 0, 0);
    return today <= mansetsuDate;
  });

  const inactiveJobs = jobs.filter((job) => {
    if (!job.tanggalMansetsu) return false;
    const mansetsuDate = new Date(job.tanggalMansetsu);
    mansetsuDate.setHours(0, 0, 0, 0);
    return today > mansetsuDate;
  });

  const displayedJobs = activeTab === 'aktif' ? activeJobs : inactiveJobs;

  return (
    <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-6 md:p-8 relative">
      {/* Header Area */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-dashboard/dashboard"
            className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
              Job Management
            </h1>
            <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">
              Kelola job, sinkronisasi, dan assign job siswa.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors border border-transparent"
        >
          <Plus size={18} strokeWidth={2} />
          Tambah Job Baru
        </button>
      </header>

      {/* Main Content */}
      <div className="bg-white border border-gray-200/60 rounded-xl relative z-10 shadow-sm overflow-hidden">

        {/* Tabs / Toolbar */}
        <div className="px-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 gap-4 pt-2">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('aktif')}
              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'aktif'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <LayoutList size={18} />
              Job Aktif
            </button>
            <button
              onClick={() => setActiveTab('nonaktif')}
              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'nonaktif'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Briefcase size={18} />
              Job Nonaktif
            </button>
          </div>
          <div className="text-sm text-gray-500 pb-4 sm:pb-0">
            Total {displayedJobs.length} Job {activeTab === 'aktif' ? 'Aktif' : 'Nonaktif'}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {displayedJobs.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                <Briefcase size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {activeTab === 'aktif' ? 'Belum ada Job Aktif' : 'Belum ada Job Nonaktif'}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {activeTab === 'aktif'
                  ? 'Klik tombol "Tambah Job Baru" di atas untuk mulai membuat job dan meng-assign siswa.'
                  : 'Job akan otomatis pindah ke sini jika sudah melewati (H+1) Tanggal Mansetsu.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-600 uppercase bg-gray-100/80 border-b border-gray-200/80">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold w-12">No</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Job Title</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Tgl Dibuat</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Deadline Dokumen</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Tgl Mansetsu</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Kuota</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Occupancy</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedJobs.map((job, index) => (
                  <tr key={job.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{job.title}</div>
                      {job.description && (
                        <div
                          className="text-xs text-gray-500 mt-1 max-w-xs truncate cursor-pointer hover:text-emerald-600 transition-colors"
                          onClick={() => setDescriptionModalData({ isOpen: true, title: job.title, description: job.description })}
                        >
                          {job.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${activeTab === 'nonaktif'
                          ? 'bg-gray-100 text-gray-600 border border-gray-200/50'
                          : job.status === 'Waiting'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                            : job.status === 'Submission Day'
                              ? 'bg-red-50 text-red-700 border border-red-200/50'
                              : job.status === 'Ongoing'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                : job.status === 'Mansetsu Day'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200/50'
                          }`}
                      >
                        {activeTab === 'nonaktif' ? 'Inactive' : job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {job.deadlineDokumen ? new Date(job.deadlineDokumen).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {job.tanggalMansetsu ? new Date(job.tanggalMansetsu).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">
                      {job.kuota ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenViewModal(job.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors cursor-pointer ${job.kuota != null && students.filter(s => s.id_master_job === Number(job.id)).length >= job.kuota
                          ? 'bg-red-50 hover:bg-red-100 border-red-200/80 text-red-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200/80 text-emerald-700'
                          }`}
                        title="Lihat daftar siswa"
                      >
                        <Users size={14} />
                        <span className="font-medium">
                          {students.filter(s => s.id_master_job === Number(job.id)).length} / {job.kuota ?? '-'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenAssignModal(job.id)}
                          disabled={activeTab === 'nonaktif' || (job.kuota != null && students.filter(s => s.id_master_job === Number(job.id)).length >= job.kuota)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'nonaktif' || (job.kuota != null && students.filter(s => s.id_master_job === Number(job.id)).length >= job.kuota)
                            ? 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
                            : 'text-emerald-700 bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                          title="Assign Siswa"
                        >
                          <Users size={14} /> Assign
                        </button>
                        <button
                          onClick={() => setEditModalData({ isOpen: true, job })}
                          className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'nonaktif'
                            ? 'text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                            : 'text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100 hover:text-amber-800'
                            }`}
                          title="Edit Job"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteModalData({ isOpen: true, jobId: job.id })}
                          className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'nonaktif'
                            ? 'text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                            : 'text-red-700 bg-red-50 border border-red-200/60 hover:bg-red-100 hover:text-red-800'
                            }`}
                          title="Delete Job"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddJobModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddJob}
          isSubmitting={isSubmitting}
        />
      )}

      {assignModalData.isOpen && selectedJobForAssignment && (
        <AssignStudentModal
          jobTitle={selectedJobForAssignment.title}
          students={students}
          initialSelectedStudents={students.filter(s => s.id_master_job === Number(selectedJobForAssignment.id)).map(s => s.no_peserta)}
          isSubmitting={isSubmitting}
          onClose={() => setAssignModalData({ isOpen: false, jobId: null })}
          onSave={handleSaveAssignments}
        />
      )}

      {viewModalData.isOpen && selectedJobForView && (
        <ViewAssignedStudentsModal
          jobTitle={selectedJobForView.title}
          jobId={selectedJobForView.id}
          students={students}
          onClose={() => setViewModalData({ isOpen: false, jobId: null })}
          onUnassign={handleUnassignUser}
        />
      )}

      {descriptionModalData.isOpen && (
        <JobDescriptionModal
          jobTitle={descriptionModalData.title}
          description={descriptionModalData.description}
          onClose={() => setDescriptionModalData({ isOpen: false, title: '', description: '' })}
        />
      )}

      {editModalData.isOpen && editModalData.job && (
        <EditJobModal
          initialData={editModalData.job}
          onClose={() => setEditModalData({ isOpen: false, job: null })}
          onSave={handleUpdateJob}
          isSubmitting={isSubmitting}
        />
      )}

      {deleteModalData.isOpen && (
        <DeleteJobModal
          onClose={() => setDeleteModalData({ isOpen: false, jobId: null })}
          onConfirm={handleConfirmDelete}
          isSubmitting={isSubmitting}
        />
      )}

      {isLoading && <LoadingOverlay text="MEMUAT DATA..." fixed={true} />}

    </main>
  );
}
