import { useState, useMemo, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface StudentData {
  no_peserta: string;
  nama_lengkap: string;
  angkatan: string;
  job_title?: string | null;
  id_master_job?: number | null;
}

interface AssignStudentModalProps {
  jobTitle: string;
  students: StudentData[];
  initialSelectedStudents: string[]; // array of no_peserta
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (selectedStudentIds: string[]) => void;
}

export default function AssignStudentModal({
  jobTitle,
  students,
  initialSelectedStudents,
  isSubmitting = false,
  onClose,
  onSave,
}: AssignStudentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set(initialSelectedStudents));
  const [filterAngkatan, setFilterAngkatan] = useState('Semua');

  // Filter out ALL students who already have an assignment
  const availableStudents = useMemo(() => {
    return students.filter(s => !s.id_master_job);
  }, [students]);

  const uniqueAngkatan = useMemo(() => {
    const angkatanList = availableStudents.map((s) => s.angkatan).filter((a) => a && a !== '-');
    return Array.from(new Set(angkatanList));
  }, [availableStudents]);

  const filteredStudents = useMemo(() => {
    let result = availableStudents;
    const q = searchTerm.toLowerCase().trim();

    if (filterAngkatan !== 'Semua') {
      result = result.filter((s) => s.angkatan === filterAngkatan);
    }

    if (q) {
      result = result.filter(
        (s) =>
          s.nama_lengkap.toLowerCase().includes(q) ||
          s.no_peserta.toLowerCase().includes(q)
      );
    }

    return result;
  }, [availableStudents, searchTerm, filterAngkatan]);

  const handleToggleSelect = (no_peserta: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(no_peserta)) {
        next.delete(no_peserta);
      } else {
        next.add(no_peserta);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const allFilteredSelected = filteredStudents.every((s) => selectedStudents.has(s.no_peserta));

    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        // Deselect all filtered
        filteredStudents.forEach((s) => next.delete(s.no_peserta));
      } else {
        // Select all filtered
        filteredStudents.forEach((s) => next.add(s.no_peserta));
      }
      return next;
    });
  };

  const handleSubmit = () => {
    onSave(Array.from(selectedStudents));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Assign Students</h2>
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

        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau no. peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <select
            value={filterAngkatan}
            onChange={(e) => setFilterAngkatan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <option value="Semua">Semua Angkatan</option>
            {uniqueAngkatan.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada siswa yang ditemukan.
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap bg-white border border-gray-200/60 rounded-lg overflow-hidden">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100/80 sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents.has(s.no_peserta))}
                      onChange={handleSelectAllFiltered}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">No. Peserta</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Nama Siswa</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Angkatan</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.no_peserta}
                    onClick={() => handleToggleSelect(student.no_peserta)}
                    className="hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.no_peserta)}
                        onChange={() => handleToggleSelect(student.no_peserta)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{student.no_peserta}</td>
                    <td className="px-4 py-3 text-gray-700">{student.nama_lengkap}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">
                        {student.angkatan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {student.job_title ? (
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs border border-green-200">
                          {student.job_title}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          Belum Diassign
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-emerald-700">{selectedStudents.size}</span> siswa dipilih
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Assignment'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
