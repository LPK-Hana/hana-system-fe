'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  JOB_CATEGORIES,
  MAX_JOB_PEMINATAN,
  PROGRAM_TYPES,
  type ProgramType,
} from '@/lib/job-categories';
import { loadStudentPeminatan, saveStudentPeminatan } from '@/lib/student-peminatan-storage';

export default function PeminatanPage() {
  const [programType, setProgramType] = useState<ProgramType | ''>('');
  const [jobCategoryIds, setJobCategoryIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadStudentPeminatan();
    if (saved) {
      setProgramType(saved.programType);
      setJobCategoryIds(saved.jobCategoryIds);
    }
    setReady(true);
  }, []);

  const toggleJob = (id: string) => {
    setJobCategoryIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_JOB_PEMINATAN) {
        toast.error(`Maksimal ${MAX_JOB_PEMINATAN} bidang pekerjaan.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = () => {
    if (!programType) {
      toast.error('Pilih program Ginou Jisshu atau Tokutei Ginou terlebih dahulu.');
      return;
    }
    if (jobCategoryIds.length === 0) {
      toast.error('Pilih minimal 1 bidang pekerjaan.');
      return;
    }
    saveStudentPeminatan({ programType, jobCategoryIds });
    toast.success('Peminatan berhasil disimpan.');
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#F4F7F4] flex items-center justify-center text-gray-500 text-sm">
        Memuat…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/student-dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-emerald-900" size={28} strokeWidth={1.5} />
            <h1 className="text-2xl md:text-3xl font-serif text-gray-900">Bidang Peminatan</h1>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl">
            Pilih program (Ginou Jisshu atau Tokutei Ginou) dan hingga {MAX_JOB_PEMINATAN} jenis bidang pekerjaan sesuai minat Anda.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Program</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PROGRAM_TYPES.map((opt) => {
              const selected = programType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProgramType(opt.value)}
                  className={`text-left p-5 border-2 transition-colors rounded-sm ${
                    selected ? 'border-emerald-800 bg-emerald-50/50' : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-gray-400 tracking-wide mb-1">{opt.kanji}</p>
                      <p className="font-serif text-lg text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{opt.sub}</p>
                    </div>
                    {selected && <Check size={20} className="text-emerald-800 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Jenis Bidang Pekerjaan
            </h2>
            <span className="text-xs text-gray-500">
              Dipilih: <span className="font-semibold text-emerald-900">{jobCategoryIds.length}</span> / {MAX_JOB_PEMINATAN}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOB_CATEGORIES.map((job) => {
              const selected = jobCategoryIds.includes(job.id);
              const order = selected ? jobCategoryIds.indexOf(job.id) + 1 : 0;
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => toggleJob(job.id)}
                  className={`text-left p-5 border transition-colors rounded-sm ${
                    selected
                      ? 'border-emerald-800 bg-emerald-50/40 ring-2 ring-emerald-800/20'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="text-3xl mb-3">{job.emoji}</div>
                  <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                    {job.kanji} · {job.romaji}
                  </p>
                  <p className="font-serif text-base text-gray-900 mt-1">{job.titleId}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{job.description}</p>
                  {selected && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-800 mt-3 flex items-center gap-1">
                      <Check size={12} /> Pilihan #{order}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-900 text-white text-xs font-semibold uppercase tracking-widest hover:bg-emerald-950 transition-colors"
          >
            Simpan Peminatan
          </button>
        </div>
      </div>
    </main>
  );
}
