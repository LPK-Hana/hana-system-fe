import Link from 'next/link';
import type { ReactNode } from 'react';

type Accent = 'emerald' | 'red';

const accentMap = {
  emerald: {
    hoverBorder: 'hover:border-emerald-900/30',
    slideBg: 'bg-emerald-50/30',
    iconBorder: 'border-emerald-900/20',
    iconText: 'text-emerald-900',
    iconHover: 'group-hover:bg-emerald-900 group-hover:text-white',
    titleHover: 'group-hover:text-emerald-950',
    ctaText: 'text-emerald-900',
    ctaUnderline: 'bg-emerald-900',
    menuBorder: 'hover:border-emerald-900/30',
    menuIconBorder: 'border-emerald-900/20',
    menuIconText: 'text-emerald-900',
    menuChevron: 'group-hover:text-emerald-900',
  },
  red: {
    hoverBorder: 'hover:border-red-800/30',
    slideBg: 'bg-red-50/30',
    iconBorder: 'border-red-800/20',
    iconText: 'text-red-800',
    iconHover: 'group-hover:bg-red-800 group-hover:text-white',
    titleHover: '',
    ctaText: 'text-red-800',
    ctaUnderline: 'bg-red-800',
    menuBorder: 'hover:border-red-800/30',
    menuIconBorder: 'border-red-800/20',
    menuIconText: 'text-red-800',
    menuChevron: 'group-hover:text-red-800',
  },
} as const;

function CtaArrow() {
  return (
    <svg
      className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

type DashboardHubCardProps = {
  href: string;
  title: string;
  icon: ReactNode;
  cta?: string;
  subtitle?: string;
  accent?: Accent;
  layout?: 'default' | 'centered' | 'compact';
};

export function DashboardHubCard({
  href,
  title,
  icon,
  cta,
  subtitle,
  accent = 'emerald',
  layout = 'default',
}: DashboardHubCardProps) {
  const a = accentMap[accent];

  if (layout === 'centered') {
    return (
      <Link
        href={href}
        className={`group block relative bg-white p-5 md:p-10 lg:p-14 border border-gray-200/60 ${a.hoverBorder} transition-colors duration-700 ease-out overflow-hidden`}
      >
        <div
          className={`absolute inset-0 ${a.slideBg} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0`}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <div
            className={`w-10 h-10 md:w-14 md:h-14 border ${a.iconBorder} flex items-center justify-center mb-3 md:mb-5 ${a.iconText} bg-white ${a.iconHover} transition-colors duration-500 ease-out`}
          >
            {icon}
          </div>
          <h2
            className={`text-sm md:text-xl lg:text-2xl font-serif text-gray-900 tracking-wide ${a.titleHover} transition-colors duration-500`}
          >
            {title}
          </h2>
        </div>
      </Link>
    );
  }

  if (layout === 'compact') {
    return (
      <Link
        href={href}
        className={`group block relative bg-white p-8 md:p-10 border border-gray-200/60 ${a.hoverBorder} transition-colors duration-500 overflow-hidden`}
      >
        <div
          className={`absolute inset-0 ${a.slideBg} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out z-0`}
        />
        <div className="relative z-10">
          <div
            className={`w-12 h-12 border ${a.iconBorder} flex items-center justify-center mb-6 ${a.iconText} bg-white ${a.iconHover} transition-colors duration-500`}
          >
            {icon}
          </div>
          <h2 className="text-xl font-serif text-gray-900 mb-2">{title}</h2>
          {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group block relative bg-white p-10 md:p-14 border border-gray-200/60 ${a.hoverBorder} transition-colors duration-700 ease-out overflow-hidden`}
    >
      <div
        className={`absolute inset-0 ${a.slideBg} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0`}
      />
      <div className="relative z-10">
        <div
          className={`w-14 h-14 border ${a.iconBorder} flex items-center justify-center mb-8 ${a.iconText} bg-white ${a.iconHover} transition-colors duration-500 ease-out`}
        >
          {icon}
        </div>
        <h2
          className={`text-2xl font-serif text-gray-900 mb-6 tracking-wide ${a.titleHover} transition-colors duration-500`}
        >
          {title}
        </h2>
        {cta ? (
          <div className={`flex items-center text-xs tracking-widest uppercase ${a.ctaText} font-semibold`}>
            <span className="relative">
              {cta}
              <span
                className={`absolute -bottom-1 left-0 w-0 h-[1px] ${a.ctaUnderline} group-hover:w-full transition-all duration-500 ease-out`}
              />
            </span>
            <CtaArrow />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

type DashboardMenuRowProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onClick: () => void;
  accent?: Accent;
};

export function DashboardMenuRow({
  title,
  subtitle,
  icon,
  onClick,
  accent = 'emerald',
}: DashboardMenuRowProps) {
  const a = accentMap[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-between bg-white border border-gray-200/60 ${a.menuBorder} p-6 text-left transition-colors w-full`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 border ${a.menuIconBorder} flex items-center justify-center ${a.menuIconText}`}>
          {icon}
        </div>
        <div>
          <p className="font-serif text-lg text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <svg
        className={`w-[18px] h-[18px] text-gray-400 ${a.menuChevron} transition-colors`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}
