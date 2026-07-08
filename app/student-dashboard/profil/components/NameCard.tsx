import React from 'react';
import hanaLogo from '@/logo/hana-logo.png';
import indoxjapan from '@/logo/indoxjapan.png';

const PhoneIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.79 19.79 19.79 0 01.07 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
  </svg>
);

const MailIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const DummyPhoto: React.FC = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(160deg, #c0392b 60%, #922b21 100%)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Head */}
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: '#f5cba7',
      }}
    />
    {/* Body / Suit */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 90,
        height: 110,
        background: '#1a1a1a',
        borderRadius: '10px 10px 0 0',
      }}
    >
      {/* Shirt */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 20,
          height: 30,
          background: 'white',
        }}
      />
      {/* Tie */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 10,
          height: 50,
          background: '#1a1a1a',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 70%, 50% 100%, 0% 70%)',
        }}
      />
    </div>
  </div>
);

export interface NameCardProps {
  studentId?: string;
  nameRomaji?: string;
  nameJapanese?: string;
  classJapanese?: string;
  phone?: string;
  email?: string;
  address?: string;
  profileImage?: string;
  logoSize?: number;
}

const NameCard: React.FC<NameCardProps> = ({
  studentId = 'HANA01002',
  nameRomaji = 'MUHAMMAD ZIDDAN AZZAKY',
  nameJapanese = 'ムハンマド・ジッダン・アザキー',
  classJapanese = '東京クラス',
  phone = '+62 821-2345-6789',
  email = 'info@gada-wiryakarsa.id',
  address = 'Jl. Sudirman Kav. 50, Jakarta',
  profileImage,
  logoSize = 110,
}) => {
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Barlow:wght@700;800&display=swap');
      `}</style>

      <div
        style={{
          width: 860,
          height: 490,
          background: '#e8e8e2',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {/* ── Decorative geometric shapes ── */}
        {/* Bottom-right */}
        <div style={{ position: 'absolute', bottom: 60, right: 0, width: 0, height: 0, borderLeft: '120px solid transparent', borderBottom: '120px solid #1a3a5c', opacity: 0.85 }} />
        <div style={{ position: 'absolute', bottom: 60, right: 0, width: 0, height: 0, borderLeft: '80px solid transparent', borderBottom: '140px solid #2980b9', opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: 60, right: 30, width: 0, height: 0, borderLeft: '60px solid transparent', borderBottom: '90px solid #5dade2', opacity: 0.6 }} />
        {/* Bottom-left */}
        <div style={{ position: 'absolute', bottom: 60, left: 0, width: 0, height: 0, borderRight: '90px solid transparent', borderBottom: '100px solid #2980b9', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: 60, left: 0, width: 0, height: 0, borderRight: '55px solid transparent', borderBottom: '130px solid #1a3a5c', opacity: 0.7 }} />

        {/* ── Header 3-kolom simetris ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 24px',
          height: 140,
        }}>
          {/* Kiri: Logo Hana */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <img
              src={hanaLogo.src}
              alt="Hana Logo"
              style={{ width: logoSize * 1.35, height: logoSize * 1.35, objectFit: 'contain' }}
            />
          </div>

          {/* Tengah: Teks judul */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ fontSize: 33, fontWeight: 800, color: '#1a3a5c', letterSpacing: 1, lineHeight: 1.1, margin: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>
              LPK GADA WIRYA KARSA
            </h1>
          </div>

          {/* Kanan: Bendera Indo x Japan */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <img
              src={indoxjapan.src}
              alt="Indonesia x Japan"
              style={{ height: logoSize, objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: 'flex', padding: '0 28px 0 80px', gap: 36, alignItems: 'center', justifyContent: 'flex-start' }}>
          {/* Photo */}
          <div
            style={{
              width: 180,
              height: 210,
              flexShrink: 0,
              border: '3px solid #8a9bb0',
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallbackTried) {
                    img.dataset.fallbackTried = '1';
                    const src = img.src;
                    if (src.endsWith('.jpg')) {
                      img.src = src.replace(/\.jpg$/, '.jpeg');
                    } else if (src.endsWith('.jpeg')) {
                      img.src = src.replace(/\.jpeg$/, '.jpg');
                    } else {
                      img.style.display = 'none';
                    }
                  } else {
                    img.style.display = 'none';
                  }
                }}
              />
            ) : (
              <DummyPhoto />
            )}
          </div>

          {/* Info */}
          <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 28.6, fontWeight: 800, color: '#1a3a5c', letterSpacing: 1 }}>
              {studentId}
            </div>
            <div style={{ fontSize: 30.8, fontWeight: 800, color: '#1a3a5c', letterSpacing: 0.5, marginTop: 4, lineHeight: 1.1 }}>
              {nameRomaji}
            </div>
            <div
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 28.6,
                fontWeight: 700,
                color: '#1a3a5c',
                marginTop: 8,
                letterSpacing: 1,
              }}
            >
              {nameJapanese}
            </div>
            <div
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 28.6,
                fontWeight: 700,
                color: '#1a3a5c',
                marginTop: 6,
                letterSpacing: 1,
              }}
            >
              {classJapanese}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: '#1a3a5c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 24px 8px 24px',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontSize: 16.5, fontWeight: 600, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
            <PhoneIcon size={22} />
            +62 812-3335-9292
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontSize: 16.5, fontWeight: 600, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
            <MailIcon size={22} />
            info@gada-wiryakarsa.id
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontSize: 16.5, fontWeight: 600, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
            <MapPinIcon size={22} />
            Topaz Commercial Jl.Boulevard Selatan No.66
          </div>
        </div>
      </div>
    </>
  );
};

export default NameCard;
