import type { ReactNode } from 'react';
import RsuiteProvider from '@/components/RsuiteProvider';
import 'rsuite/dist/rsuite.min.css';

export default function JishuseiLayout({ children }: { children: ReactNode }) {
  return <RsuiteProvider>{children}</RsuiteProvider>;
}
