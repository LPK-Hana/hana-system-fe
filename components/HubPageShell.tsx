import type { ReactNode } from 'react';

type HubPageShellProps = {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
};

export function HubPageShell({
  children,
  maxWidth = 'max-w-6xl',
  className = '',
}: HubPageShellProps) {
  return (
    <main
      className={`min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-6 md:p-12 relative overflow-hidden ${className}`}
    >
      <div className="hana-wagara hana-wagara-subtle" aria-hidden />
      <div className={`relative z-10 ${maxWidth} mx-auto`}>{children}</div>
    </main>
  );
}
