import { X } from 'lucide-react';

interface StudentData {
  no_peserta: string;
  nama_lengkap: string;
  angkatan: string;
  id_master_job?: number | null;
}

interface ViewAssignedStudentsModalProps {
  jobTitle: string;
  jobId: string;
  students: StudentData[];
  onClose: () => void;
  onUnassign: (userName: string) => void;
}

export default function ViewAssignedStudentsModal({
  jobTitle,
  jobId,
  students,
  onClose,
  onUnassign,
}: ViewAssignedStudentsModalProps) {
  const assignedStudents = students.filter((s) => s.id_master_job === Number(jobId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Siswa yang Di-assign</h2>
            <p className="text-sm text-gray-500 mt-1">
              Job: <span className="font-medium text-gray-900">{jobTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {assignedStudents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Belum ada siswa yang di-assign untuk job ini.
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap bg-white border border-gray-200/60 rounded-lg overflow-hidden">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100/80 sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-16 text-center">No</th>
                  <th scope="col" className="px-4 py-3 font-semibold">No. Peserta</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Nama Siswa</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Angkatan</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignedStudents.map((student, index) => (
                  <tr key={student.no_peserta} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-emerald-600">{student.no_peserta}</td>
                    <td className="px-4 py-3 text-gray-800">{student.nama_lengkap}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">
                        {student.angkatan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onUnassign(student.no_peserta)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200/60"
                      >
                        Unassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-emerald-700">{assignedStudents.length}</span> siswa
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
