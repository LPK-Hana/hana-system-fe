import React from 'react';
import hanaLogo from '@/logo/hana-logo.png';
import indoxjapan from '@/logo/indoxjapan.png';

const PhoneIcon = ({ size = "2mm" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.79 19.79 19.79 0 01.07 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
  </svg>
);

const MailIcon = ({ size = "2mm" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = ({ size = "2mm" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CrossIcon = ({ size = "1.4mm" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="3">
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const PlaceholderPhoto: React.FC = () => (
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
        bottom: '10mm',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '5mm',
        height: '5mm',
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
        width: '9mm',
        height: '11mm',
        background: '#1a1a1a',
        borderRadius: '1mm 1mm 0 0',
      }}
    >
      {/* Shirt */}
      <div
        style={{
          position: 'absolute',
          top: '0.8mm',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '2mm',
          height: '3mm',
          background: 'white',
        }}
      />
      {/* Tie */}
      <div
        style={{
          position: 'absolute',
          top: '1.4mm',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1mm',
          height: '5mm',
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
  photoUrl?: string;
  logoTop?: number;
  logoLeft?: number;
  logoRight?: number;
  logoBottom?: number;
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
  photoUrl,
  logoTop = 40,
  logoLeft = 30,
  logoRight,
  logoBottom,
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
          width: '85.6mm',
          height: '53.98mm',
          background: '#e8e8e2',
          borderRadius: '0.8mm',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0.8mm 4mm rgba(0,0,0,0.25)',
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {/* ── Decorative geometric shapes ── */}
        {/* Bottom-right */}
        <div style={{ position: 'absolute', bottom: '6mm', right: 0, width: 0, height: 0, borderLeft: '12mm solid transparent', borderBottom: '12mm solid #1a3a5c', opacity: 0.85 }} />
        <div style={{ position: 'absolute', bottom: '6mm', right: 0, width: 0, height: 0, borderLeft: '8mm solid transparent', borderBottom: '14mm solid #2980b9', opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: '6mm', right: '3mm', width: 0, height: 0, borderLeft: '6mm solid transparent', borderBottom: '9mm solid #5dade2', opacity: 0.6 }} />
        {/* Bottom-left */}
        <div style={{ position: 'absolute', bottom: '6mm', left: 0, width: 0, height: 0, borderRight: '9mm solid transparent', borderBottom: '10mm solid #2980b9', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: '6mm', left: 0, width: 0, height: 0, borderRight: '5.5mm solid transparent', borderBottom: '13mm solid #1a3a5c', opacity: 0.7 }} />

        {/* ── Header 3-kolom simetris ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1.4mm 2.4mm',
          height: '14mm',
        }}>
          {/* Kiri: Logo Hana */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <img
              src={hanaLogo.src}
              alt="Hana Logo"
              style={{ width: (logoSize / 10) * 1.35 + 'mm', height: (logoSize / 10) * 1.35 + 'mm', objectFit: 'contain' }}
            />
          </div>

          {/* Tengah: Teks judul */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ fontSize: '3.3mm', fontWeight: 800, color: '#1a3a5c', letterSpacing: '0.1mm', lineHeight: 1.1, margin: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>
              LPK GADA WIRYA KARSA
            </h1>
          </div>

          {/* Kanan: Bendera Indo x Japan */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <img
              src={indoxjapan.src}
              alt="Indonesia x Japan"
              style={{ height: (logoSize / 10) + 'mm', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: 'flex', padding: '1.6mm 2.8mm 0 8mm', gap: '3.6mm', alignItems: 'center', justifyContent: 'flex-start' }}>
          {/* Photo */}
          <div
            style={{
              width: '18mm',
              height: '21mm',
              flexShrink: 0,
              border: '0.3mm solid #8a9bb0',
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Foto Siswa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <PlaceholderPhoto />
            )}
          </div>

          {/* Info */}
          <div style={{ paddingTop: '0.8mm', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '2.86mm', fontWeight: 800, color: '#1a3a5c', letterSpacing: '0.1mm' }}>
              {studentId}
            </div>
            <div style={{ fontSize: '3.08mm', fontWeight: 800, color: '#1a3a5c', letterSpacing: '0.05mm', marginTop: '0.4mm', lineHeight: 1.1 }}>
              {nameRomaji}
            </div>
            <div
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: '2.86mm',
                fontWeight: 700,
                color: '#1a3a5c',
                marginTop: '0.8mm',
                letterSpacing: '0.1mm',
              }}
            >
              {nameJapanese}
            </div>
            <div
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: '2.86mm',
                fontWeight: 700,
                color: '#1a3a5c',
                marginTop: '0.6mm',
                letterSpacing: '0.1mm',
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
            height: '6mm',
            background: '#1a3a5c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 2mm 0.8mm 2mm',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1mm', color: 'white', fontSize: '1.65mm', fontWeight: 600, letterSpacing: '0.03mm', whiteSpace: 'nowrap' }}>
            <PhoneIcon size="2.2mm" />
            +62 812-3335-9292
          </div>
          <div style={{ width: '0.1mm', height: '3mm', background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1mm', color: 'white', fontSize: '1.65mm', fontWeight: 600, letterSpacing: '0.03mm', whiteSpace: 'nowrap' }}>
            <MailIcon size="2.2mm" />
            info@gada-wiryakarsa.id
          </div>
          <div style={{ width: '0.1mm', height: '3mm', background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1mm', color: 'white', fontSize: '1.65mm', fontWeight: 600, letterSpacing: '0.03mm', whiteSpace: 'nowrap' }}>
            <MapPinIcon size="2.2mm" />
            Topaz Commercial Jl.Boulevard Selatan No.66
          </div>
        </div>
      </div>
    </>
  );
};

export default NameCard;
