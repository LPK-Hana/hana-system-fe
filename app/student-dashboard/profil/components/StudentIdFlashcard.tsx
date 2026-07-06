import React from 'react';
import hanaLogo from '@/logo/hana-logo.png';

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.79 19.79 19.79 0 01.07 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const DummyPhoto: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br from-[#c0392b] to-[#922b21] flex flex-col items-center justify-end relative overflow-hidden">
    <div className="w-[45%] aspect-square rounded-full bg-[#f5cba7] mb-1 z-10" />
    <div className="w-[85%] h-[45%] bg-[#1a1a1a] rounded-t-xl relative flex justify-center">
      <div className="absolute top-1 w-[20%] h-[30%] bg-white" />
      <div className="absolute top-2.5 w-[12%] h-[80%] bg-[#1a1a1a] z-10" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 70%, 50% 100%, 0% 70%)' }} />
    </div>
  </div>
);

export interface StudentIdFlashcardProps {
  profileImage?: string;
  nameLatin?: string;
  nameKatakana?: string;
  jmsId?: string;
  studentClass?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function StudentIdFlashcard({
  profileImage,
  nameLatin = 'MUHAMMAD ZIDDAN AZZAKY',
  nameKatakana = 'ムハンマド・ジッダン・アザキー',
  jmsId = 'HANA01002',
  studentClass = '東京クラス',
  phone = '+62 821-2345-6789',
  email = 'info@gada-wiryakarsa.id',
  address = 'Jl. Sudirman Kav. 50, Jakarta',
}: StudentIdFlashcardProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Barlow:wght@700;800&display=swap');
      `}</style>
      
      <div className="relative w-full max-w-[500px] aspect-[1.75] bg-[#e8e8e2] rounded-lg shadow-xl overflow-hidden text-[#1a3a5c] mx-auto flex flex-col" style={{ fontFamily: "'Barlow', sans-serif" }}>
        
        {/* ── Decorative geometric shapes ── */}
        <div className="absolute bottom-9 right-0 w-0 h-0 border-l-[70px] border-l-transparent border-b-[70px] border-b-[#1a3a5c]/85" />
        <div className="absolute bottom-9 right-0 w-0 h-0 border-l-[50px] border-l-transparent border-b-[85px] border-b-[#2980b9]/70" />
        <div className="absolute bottom-9 right-4 w-0 h-0 border-l-[40px] border-l-transparent border-b-[60px] border-b-[#5dade2]/60" />

        <div className="absolute bottom-9 left-0 w-0 h-0 border-r-[55px] border-r-transparent border-b-[60px] border-b-[#2980b9]/60" />
        <div className="absolute bottom-9 left-0 w-0 h-0 border-r-[35px] border-r-transparent border-b-[80px] border-b-[#1a3a5c]/70" />

        {/* ── Header ── */}
        <div className="flex items-center justify-center pt-5 pb-1 px-4 gap-4 relative z-10 w-full">
          <img src={hanaLogo.src} alt="Hana Logo" className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-contain shrink-0" />
          <div className="flex flex-col">
            <h1 className="text-[17px] sm:text-[20px] font-extrabold tracking-wide leading-[1.1] m-0">
              LPK GADA WIRYA KARSA
            </h1>
            <h2 className="text-[12px] sm:text-[14px] font-bold tracking-widest leading-[1.1] m-0 mt-0.5">
              INDONESIA
            </h2>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex px-5 sm:px-8 mt-2 sm:mt-3 gap-5 sm:gap-6 items-start justify-center relative z-10 flex-1 min-h-0 w-full">
          {/* Photo */}
          <div className="w-[28%] max-w-[120px] aspect-[3/4] shrink-0 border-[2.5px] border-[#8a9bb0] overflow-hidden bg-white shadow-sm rounded-sm">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <DummyPhoto />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-start pt-1 flex-1 min-w-0">
            <div className="text-[14px] sm:text-[15px] font-extrabold tracking-widest text-[#1a3a5c]/90 uppercase">
              {jmsId}
            </div>
            <div className="text-[16px] sm:text-[18px] font-extrabold tracking-wide leading-tight mt-1 truncate">
              {nameLatin}
            </div>
            <div className="font-['Noto_Sans_JP'] text-[15px] sm:text-[17px] font-bold tracking-wider mt-1.5 truncate">
              {nameKatakana}
            </div>
            <div className="font-['Noto_Sans_JP'] text-[14px] sm:text-[16px] font-bold tracking-wider mt-1 text-[#1a3a5c]/90 truncate">
              {studentClass}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="absolute bottom-0 left-0 right-0 h-9 sm:h-10 bg-[#1a3a5c] flex items-center justify-between px-3 sm:px-4 z-10">
          <div className="flex items-center justify-center gap-1.5 text-white text-[9px] sm:text-[10px] font-semibold flex-1 min-w-0">
            <PhoneIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
          <div className="w-px h-4 sm:h-5 bg-white/30 shrink-0 mx-1.5 sm:mx-2" />
          <div className="flex items-center justify-center gap-1.5 text-white text-[9px] sm:text-[10px] font-semibold flex-1 min-w-0">
            <MailIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <div className="w-px h-4 sm:h-5 bg-white/30 shrink-0 mx-1.5 sm:mx-2" />
          <div className="flex items-center justify-center gap-1.5 text-white text-[9px] sm:text-[10px] font-semibold flex-[1.2] min-w-0">
            <MapPinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        </div>
        
      </div>
    </>
  );
}
