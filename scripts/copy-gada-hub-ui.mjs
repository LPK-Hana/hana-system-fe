import fs from 'node:fs';
import path from 'node:path';

const GADA_ROOT = path.resolve('d:/Job/jukyu-lms/Gada-Wirya-Karsa/gada-system-fe/src');
const HANA_ROOT = path.resolve('d:/Job/jukyu-lms/hana-system-fe');

const BLUE_TO_EMERALD = [
  ['blue-950', 'emerald-950'],
  ['blue-900', 'emerald-900'],
  ['blue-800', 'emerald-800'],
  ['blue-700', 'emerald-700'],
  ['blue-600', 'emerald-600'],
  ['blue-500', 'emerald-500'],
  ['blue-400', 'emerald-400'],
  ['blue-300', 'emerald-300'],
  ['blue-200', 'emerald-200'],
  ['blue-100', 'emerald-100'],
  ['blue-50', 'emerald-50'],
  ['%230047AB', '%23047857'],
];

function transform(content) {
  let c = content;
  for (const [from, to] of BLUE_TO_EMERALD) {
    c = c.replaceAll(from, to);
  }
  c = c.replaceAll('gada_demo_entering', 'hana_demo_entering');
  c = c.replaceAll('sistem GWK', 'sistem Hana');
  c = c.replaceAll('jukyuLogo', 'hanaLogo');
  c = c.replaceAll('@/logo/jukyu-logo.png', '@/logo/hana-logo.png');
  c = c.replaceAll('Gada Wirya Karsa System', 'Hana System Administration');
  c = c.replaceAll('LPK Gada Wirya Karsa', 'Hana System');
  c = c.replaceAll('Gada Wirya Karsa', 'Hana System');
  c = c.replaceAll('ガダ・ウィルヤ・カルサ', 'ハナ・システム');
  c = c.replaceAll('alt="LPK Gada Wirya Karsa"', 'alt="Hana Karya Career Center"');
  c = c.replaceAll('export default function Home()', 'export default function HomePage()');
  return c;
}

const copies = [
  'app/admin-dashboard/dashboard/page.tsx',
  'app/student-dashboard/page.tsx',
  'app/guru-dashboard/page.tsx',
  'app/super-admin/page.tsx',
  'app/page.tsx',
];

const pemberkasanCard = `
          <Link
            href="/admin-dashboard/pemberkasan"
            className="group block relative bg-white p-10 md:p-14 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden no-underline text-inherit"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10">
              <div className="w-14 h-14 border border-emerald-900/20 flex items-center justify-center mb-8 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <FolderOpen size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Pemberkasan
              </h2>
              <div className="flex items-center text-xs tracking-widest uppercase text-emerald-900 font-semibold">
                <span className="relative">
                  Kelola Dokumen
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-900 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
                <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>`;

for (const rel of copies) {
  const src = path.join(GADA_ROOT, rel);
  const dest = path.join(HANA_ROOT, rel);
  let content = transform(fs.readFileSync(src, 'utf8'));

  content = content.replaceAll(
    'className="group block relative bg-white',
    'className="group block relative bg-white no-underline text-inherit',
  );
  content = content.replaceAll(
    'font-serif text-gray-900',
    'font-serif font-normal text-gray-900',
  );

  if (rel === 'app/guru-dashboard/page.tsx') {
    content = content.replace(
      /,\s*\{\s*href: '\/admin-dashboard\/report-murid'[\s\S]*?\},\s*/m,
      '',
    );
    content = content.replace(
      "className=\"group block relative bg-white p-10 md:p-12 border",
      "className=\"group block relative bg-white no-underline text-inherit p-10 md:p-12 border",
    );
  }

  if (rel === 'app/super-admin/page.tsx') {
    content = content.replace(
      /\s*,\s*\{\s*href: '\/super-admin\/financial'[\s\S]*?\}\s*/m,
      '',
    );
    content = content.replace(
      /\s*,\s*\{\s*href: '\/super-admin\/report-guru'[\s\S]*?\}\s*/m,
      '',
    );
  }

  if (rel === 'app/admin-dashboard/dashboard/page.tsx') {
    if (!content.includes('FolderOpen')) {
      content = content.replace(
        "  UserCog,\n} from 'lucide-react';",
        "  UserCog,\n  FolderOpen,\n} from 'lucide-react';",
      );
    }
    content = content.replace(/\s*<\/div>\s*<\/div>\s*<\/main>/, `${pemberkasanCard}\n        </div>\n      </div>\n    </main>`);
  }

  fs.writeFileSync(dest, content);
  console.log('Copied:', rel);
}

console.log('Done.');
