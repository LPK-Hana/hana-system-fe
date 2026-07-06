import { useMemo, useState } from 'react';
import { X, Search, CheckSquare, Square, FileDown } from 'lucide-react';
import { type StudentEditData } from './StudentEditModal';

interface CVSelectModalProps {
  students: StudentEditData[];
  onClose: () => void;
  onExport: (selectedStudents: StudentEditData[]) => void;
}

export default function CVSelectModal({ students, onClose, onExport }: CVSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filterAngkatan, setFilterAngkatan] = useState('Semua');

  const uniqueAngkatan = useMemo(
    () => Array.from(new Set(students.map(s => s.angkatan).filter(Boolean))),
    [students],
  );

  const filteredStudents = useMemo(() => {
    let result = students;
    if (filterAngkatan !== 'Semua') {
      result = result.filter(s => s.angkatan === filterAngkatan);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        s => s.nama_lengkap.toLowerCase().includes(q) || s.no_peserta.toLowerCase().includes(q),
      );
    }
    return result;
  }, [students, searchTerm, filterAngkatan]);

  const allSelected = filteredStudents.length > 0 && selectedIds.size === filteredStudents.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const toggleStudent = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExport = () => {
    const selected = students.filter(s => selectedIds.has(s.id));
    onExport(selected);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/45 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white border border-gray-200 shadow-2xl flex flex-col h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-serif text-gray-900">Pilih Peserta (Export CV)</h2>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
              Pilih satu atau lebih siswa dari hasil filter untuk diunduh CV-nya.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 flex flex-col gap-3 bg-white">
          <div className="flex items-center gap-3">
            <select
              value={filterAngkatan}
              onChange={e => setFilterAngkatan(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
            >
              <option value="Semua">Semua Angkatan</option>
              {uniqueAngkatan.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama atau no peserta..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-emerald-500 rounded-md"
              />
            </div>
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
            >
              {allSelected ? <CheckSquare size={18} className="text-emerald-600" /> : <Square size={18} />}
              Pilih Semua
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
          {filteredStudents.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Tidak ada data siswa ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map(student => {
                const isSelected = selectedIds.has(student.id);
                return (
                  <label
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckSquare size={18} className="text-emerald-600" />
                      ) : (
                        <Square size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{student.nama_lengkap}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{student.no_peserta}</span>
                        <span>•</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase">
                          {student.angkatan}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Terpilih: <span className="font-semibold text-emerald-600">{selectedIds.size}</span> siswa
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown size={16} />
              {selectedIds.size <= 1 ? 'Export CV' : `Export ${selectedIds.size} CV`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
