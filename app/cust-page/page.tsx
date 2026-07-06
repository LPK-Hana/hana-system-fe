'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, X, Info, Loader2, Download } from 'lucide-react';
import { exitToHome } from '@/lib/auth';
import { isDemoModeClient } from '@/lib/demo-mode';
import { demoShowcaseStudents } from '@/lib/demo/seed';
import {
  DEFAULT_JIKOSHOUKAI_VIDEO,
  getYoutubeEmbedUrl,
  resolveStudentAvatar,
} from '@/lib/student-showcase';

import ApiGuest from '@/app/api/guest/api_guest';
import CVTemplate from '../student-dashboard/cv-form/components/CVTemplate';
import { exportCVToPDF } from '../student-dashboard/cv-form/exportPdf';
import { mapApiResponseToCVData } from '@/lib/cv-mapper';
import { CVData } from '../student-dashboard/cv-form/types';

interface Student {
  id: string;
  name: string;
  nameJp: string;
  avatarEmoji: string;
  avatarUrl: string | null;
  skills: string[];
  linkVideo: string | null;
  finishBab15: number;
}

function StudentAvatar({
  student,
  size = 'card',
}: {
  student: Pick<Student, 'avatarEmoji' | 'avatarUrl' | 'name'>;
  size?: 'card' | 'modal';
}) {
  const boxClass =
    size === 'modal'
      ? 'w-16 h-16 rounded-full border-2 border-gray-200 bg-white flex-shrink-0'
      : 'w-16 h-16 rounded-full mb-3 border-2 border-gray-100 bg-gray-50 group-hover:border-emerald-700 transition-colors duration-300';

  if (student.avatarUrl) {
    return (
      <div className={`${boxClass} overflow-hidden flex items-center justify-center`}>
        <img
          src={student.avatarUrl}
          alt={student.name}
          className={
            size === 'modal'
              ? 'w-full h-full object-cover'
              : 'object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out'
          }
        />
      </div>
    );
  }

  return (
    <div
      className={`${boxClass} flex items-center justify-center ${
        size === 'card' ? 'group-hover:scale-105 transition-transform duration-500' : ''
      }`}
      aria-label={student.name}
    >
      <span className={size === 'modal' ? 'text-3xl leading-none' : 'text-4xl leading-none'}>
        {student.avatarEmoji}
      </span>
    </div>
  );
}

export default function CustPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCVData, setSelectedCVData] = useState<CVData | null>(null);
  const [isLoadingCV, setIsLoadingCV] = useState(false);

  const cvContainerRef = useRef<HTMLDivElement>(null);
  const cvContentRef = useRef<HTMLDivElement>(null);
  const [cvScale, setCvScale] = useState(1);
  const [cvHeight, setCvHeight] = useState<string>('auto');

  useEffect(() => {
    if (!isModalOpen || !selectedCVData) return;
    const container = cvContainerRef.current;
    const content = cvContentRef.current;
    if (!container || !content) return;

    let rafId: number;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const containerWidth = container.clientWidth;
        const CV_WIDTH = 794;
        const padding = 16;
        const scale = containerWidth < (CV_WIDTH + padding) ? Math.max(0.2, (containerWidth - padding) / CV_WIDTH) : 1;
        setCvScale(scale);

        const unscaledHeight = content.offsetHeight;
        if (unscaledHeight) {
          setCvHeight(`${unscaledHeight * scale}px`);
        }
      });
    });

    ro.observe(container);
    ro.observe(content);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [isModalOpen, selectedCVData]);

  const handleDownloadPDF = () => {
    if (!selectedStudent) return;
    exportCVToPDF('cv-print-area', `CV_${selectedStudent.name.replace(/\s+/g, '_')}_${selectedStudent.id}.pdf`);
  };

  useEffect(() => {
    function mapShowcaseRows(rows: ReturnType<typeof demoShowcaseStudents>): Student[] {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      return rows.map((s) => {
        const { emoji, imageUrl } = resolveStudentAvatar(
          typeof s.foto === 'string' ? s.foto : null,
          baseUrl,
        );
        const skills = Array.isArray(s.skill) ? s.skill : [];
        return {
          id: String(s.no_peserta),
          name: String(s.nama_peserta),
          nameJp: String(s.nama_katakana || s.nama_peserta),
          avatarEmoji: emoji,
          avatarUrl: imageUrl,
          skills,
          linkVideo: (s.link_video as string | null) || DEFAULT_JIKOSHOUKAI_VIDEO,
          finishBab15: Number(s.finish_bab15) || 0,
        };
      });
    }

    if (isDemoModeClient()) {
      setStudents(mapShowcaseRows(demoShowcaseStudents()));
      setLoading(false);
      return;
    }

    async function fetchShowcase() {
      try {
        const res = await ApiGuest().getListStudent();
        if (res?.status === 200 && res.data) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
          const mappedStudents = res.data.map((s: Record<string, unknown>) => {
            const { emoji, imageUrl } = resolveStudentAvatar(s.foto as string | null, baseUrl);
            return {
              id: s.no_peserta,
              name: s.nama_peserta,
              nameJp: s.nama_katakana || s.nama_peserta,
              avatarEmoji: emoji,
              avatarUrl: imageUrl,
              skills: s.skill || [],
              linkVideo: s.link_video || DEFAULT_JIKOSHOUKAI_VIDEO,
              finishBab15: s.finish_bab15,
            };
          });
          setStudents(mappedStudents);
        }
      } catch (error) {
        console.error('Failed to fetch showcase data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchShowcase();
  }, []);

  const handleOpenInfo = async (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    setIsLoadingCV(true);
    setSelectedCVData(null);
    try {
      const res = await ApiGuest().getListResume({ no_peserta: student.id });
      if (res?.status === 200 && res.data) {
        const { cv } = mapApiResponseToCVData(res.data);
        setSelectedCVData(cv);
      }
    } catch (error) {
      console.error('Failed to fetch CV data:', error);
    } finally {
      setIsLoadingCV(false);
    }
  };

  const handleCloseInfo = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // Group students by category
  const jftStudents = students.filter(s => s.skills.includes("JFT-Basic A2") || s.skills.includes("JLPT N4"));
  const n5Students = students.filter(s => s.skills.includes("JLPT N5"));
  const bab15Students = students.filter(s => s.finishBab15 === 1);

  const categories = [
    {
      key: "jft",
      titleJp: "JFT合格者",
      titleEn: "JFT-Basic Certificate Holders",
      badge: "JFT",
      data: jftStudents,
    },
    {
      key: "n5",
      titleJp: "JLPT N5合格者",
      titleEn: "JLPT N5 Certificate Holders",
      badge: "N5",
      data: n5Students,
    },
    {
      key: "bab15",
      titleJp: "第15課まで学習中",
      titleEn: "Currently Studying Up to Chapter 15",
      badge: "CH.15",
      data: bab15Students,
    },
  ];

  const getEmbedUrl = (url: string | null) => getYoutubeEmbedUrl(url);

  return (
    <main
      className="min-h-screen bg-[#F4F7F4] flex flex-col p-6 relative overflow-x-hidden font-sans text-gray-800"
    >
      {/* Decorative Wagara Background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%230047AB' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col pb-20">
        {/* Navigation */}
        <nav className="mb-12 flex items-center justify-between">
          <button
            onClick={() => exitToHome()}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-900 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold tracking-widest uppercase">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-800 animate-pulse" />
            <span className="text-sm font-semibold tracking-widest text-gray-400 uppercase">Live</span>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-20 flex flex-col items-center text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <h1 className="text-5xl md:text-6xl font-serif text-emerald-900 tracking-[0.2em]">学生リスト</h1>
            <p className="text-base text-gray-400 font-serif tracking-[0.3em] uppercase">Student List</p>
          </div>
          <div className="flex items-center w-full max-w-sm mt-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-800 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col w-full gap-24">
            {categories.map(cat => (
              <section key={cat.key}>
                {/* Category Header */}
                <div className="flex items-center gap-5 border-b border-gray-200 pb-4 mb-10">
                  <span className="px-3 py-1 bg-emerald-900 text-white text-sm font-bold tracking-widest">
                    {cat.badge}
                  </span>
                  <div>
                    <h2 className="text-2xl font-serif text-emerald-900 tracking-wider">{cat.titleJp}</h2>
                    <p className="text-sm text-gray-400 tracking-widest uppercase">{cat.titleEn}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {cat.data.map((student, idx) => (
                    <div
                      key={student.id}
                      className="group bg-white border border-emerald-200/80 p-4 flex flex-col items-center text-center hover:border-emerald-400 transition-colors duration-300"
                      style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                    >
                      {/* Avatar */}
                      <StudentAvatar student={student} size="card" />

                      {/* Name */}
                      <p className="font-serif text-lg font-bold text-gray-800 tracking-wide mb-1 group-hover:text-emerald-900 transition-colors duration-300 leading-tight">
                        {student.nameJp}
                      </p>
                      <p className="text-xs text-gray-400 tracking-wider mb-6">
                        {student.name}
                      </p>

                      {/* Info Button */}
                      <button
                        onClick={() => handleOpenInfo(student)}
                        className="mt-auto w-full bg-white border border-emerald-200 py-2 px-2 flex items-center justify-center transition-colors duration-300 hover:border-emerald-400 hover:bg-emerald-50/30"
                      >
                        <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-700 group-hover:text-emerald-900 transition-colors flex items-center gap-2">
                          <Info className="w-4 h-4" /> 詳細 / Info
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Info / CV Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleCloseInfo}
          />

          {/* Modal */}
          <div className="relative bg-[#F4F7F4] w-full max-w-[1400px] h-[95vh] overflow-y-auto border border-gray-300 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 sticky top-0 bg-[#F4F7F4] z-10">
              <div className="flex items-center gap-5">
                <StudentAvatar student={selectedStudent} size="modal" />
                <div>
                  <h2 className="font-serif text-3xl text-emerald-900 tracking-wider mb-1">{selectedStudent.nameJp}</h2>
                  <p className="text-sm text-gray-500 tracking-widest">{selectedStudent.name} · {selectedStudent.id}</p>
                </div>
              </div>
              <button
                onClick={handleCloseInfo}
                className="p-3 text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 flex flex-col gap-10">

              <div className="flex flex-col xl:flex-row gap-10">
                {/* CV Viewer */}
                <div className="flex flex-col w-full xl:w-[820px] shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-xl text-emerald-900 tracking-wider">履歴書</h3>
                      <span className="text-sm text-gray-400 tracking-widest uppercase hidden sm:inline">/ Curriculum Vitae</span>
                    </div>
                    {selectedCVData && (
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-900 text-white text-xs font-semibold tracking-wider rounded hover:bg-emerald-800 transition-colors shadow-sm"
                      >
                        <Download size={14} />
                        <span className="hidden sm:inline">Download PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </button>
                    )}
                  </div>
                  <div ref={cvContainerRef} className="w-full border border-gray-200 overflow-hidden bg-gray-200 relative flex justify-center pt-4 pb-4 px-2">
                    {isLoadingCV ? (
                      <div className="flex flex-col items-center justify-center py-64 gap-4 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-900" />
                        <span className="text-sm font-medium">Memuat CV...</span>
                      </div>
                    ) : selectedCVData ? (
                      <div style={{ height: cvHeight, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <div className="origin-top" style={{ transform: `scale(${cvScale})` }}>
                          <div ref={cvContentRef} id="cv-print-area" className="shadow-lg bg-white w-[794px]">
                            <CVTemplate data={selectedCVData} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-64 text-gray-500 font-medium">
                        CV belum tersedia / Not available
                      </div>
                    )}
                  </div>
                </div>

                {/* Jikoshoukai Video & Skills */}
                <div className="flex flex-col gap-10 flex-1 min-w-0">
                  {/* Embedded Video */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-serif text-xl text-emerald-900 tracking-wider">自己紹介動画</h3>
                      <span className="text-sm text-gray-400 tracking-widest uppercase">/ Introduction Video</span>
                    </div>
                    <div className="w-full border border-gray-200 bg-black overflow-hidden aspect-video relative">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={getEmbedUrl(selectedStudent.linkVideo)}
                        title="Jikoshoukai video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-serif text-xl text-emerald-900 tracking-wider">スキル</h3>
                      <span className="text-sm text-gray-400 tracking-widest uppercase">/ Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedStudent.skills.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 tracking-wider">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-gray-200 flex justify-end sticky bottom-0 bg-[#F4F7F4] z-10">
              <button
                onClick={handleCloseInfo}
                className="px-8 py-3 bg-emerald-900 text-white text-sm font-semibold uppercase tracking-widest hover:bg-emerald-800 transition-colors"
              >
                閉じる / Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .group {
          animation-name: fadeInUp;
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}} />
    </main>
  );
}
