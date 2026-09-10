export interface KkOccupationOption {
  id: string;
  label: string;
  jp: string;
  aliases?: string[];
}

/** Official KK occupation codes (Indonesian ↔ Japanese) — Permendagri / Dukcapil. */
export const KK_OCCUPATION_OPTIONS: KkOccupationOption[] = [
  { id: 'BELUM/TIDAK BEKERJA', label: 'Belum/Tidak Bekerja', jp: '未就労', aliases: ['BELUM TIDAK BEKERJA', 'TIDAK BEKERJA'] },
  { id: 'MENGURUS RUMAH TANGGA', label: 'Mengurus Rumah Tangga', jp: '家事・主婦' },
  { id: 'PELAJAR/MAHASISWA', label: 'Pelajar/Mahasiswa', jp: '学生', aliases: ['PELAJAR / MAHASISWA', 'PELAJAR', 'MAHASISWA'] },
  { id: 'PENSIUNAN', label: 'Pensiunan', jp: '年金受給者' },
  { id: 'PEGAWAI NEGERI SIPIL', label: 'Pegawai Negeri Sipil', jp: '公務員', aliases: ['PNS'] },
  { id: 'TENTARA NASIONAL INDONESIA', label: 'Tentara Nasional Indonesia', jp: '国民軍', aliases: ['TNI', 'TNI/POLRI'] },
  { id: 'KEPOLISIAN RI', label: 'Kepolisian RI', jp: '国家警察', aliases: ['POLRI'] },
  { id: 'PERDAGANGAN', label: 'Perdagangan', jp: '商業' },
  { id: 'PETANI/PEKEBUN', label: 'Petani/Pekebun', jp: '農家・園芸', aliases: ['PETANI / PEKEBUN'] },
  { id: 'PETERNAK', label: 'Peternak', jp: '畜産' },
  { id: 'NELAYAN/PERIKANAN', label: 'Nelayan/Perikanan', jp: '漁業', aliases: ['NELAYAN / PERIKANAN'] },
  { id: 'INDUSTRI', label: 'Industri', jp: '工業' },
  { id: 'KONSTRUKSI', label: 'Konstruksi', jp: '建設業' },
  { id: 'TRANSPORTASI', label: 'Transportasi', jp: '運輸業' },
  { id: 'KARYAWAN SWASTA', label: 'Karyawan Swasta', jp: '民間企業社員' },
  { id: 'KARYAWAN BUMN', label: 'Karyawan BUMN', jp: '国営企業社員' },
  { id: 'KARYAWAN BUMD', label: 'Karyawan BUMD', jp: '地方公営企業社員' },
  { id: 'KARYAWAN HONORER', label: 'Karyawan Honorer', jp: '臨時職員' },
  { id: 'BURUH HARIAN LEPAS', label: 'Buruh Harian Lepas', jp: '日雇い労働者' },
  { id: 'BURUH TANI/PERKEBUNAN', label: 'Buruh Tani/Perkebunan', jp: '農業労働者', aliases: ['BURUH TANI / PERKEBUNAN'] },
  { id: 'BURUH NELAYAN/PERIKANAN', label: 'Buruh Nelayan/Perikanan', jp: '漁業労働者', aliases: ['BURUH NELAYAN / PERIKANAN'] },
  { id: 'BURUH PETERNAKAN', label: 'Buruh Peternakan', jp: '畜産労働者' },
  { id: 'PEMBANTU RUMAH TANGGA', label: 'Pembantu Rumah Tangga', jp: '家事手伝い', aliases: ['PRT'] },
  { id: 'TUKANG CUKUR', label: 'Tukang Cukur', jp: '理容師' },
  { id: 'TUKANG LISTRIK', label: 'Tukang Listrik', jp: '電気技師' },
  { id: 'TUKANG BATU', label: 'Tukang Batu', jp: '石工' },
  { id: 'TUKANG KAYU', label: 'Tukang Kayu', jp: '大工' },
  { id: 'TUKANG SOL SEPATU', label: 'Tukang Sol Sepatu', jp: '靴修理' },
  { id: 'TUKANG LAS/PANDAI BESI', label: 'Tukang Las/Pandai Besi', jp: '溶接工・鍛冶師', aliases: ['TUKANG LAS / PANDAI BESI'] },
  { id: 'TUKANG JAHIT', label: 'Tukang Jahit', jp: '仕立て屋' },
  { id: 'PENATA RAMBUT', label: 'Penata Rambut', jp: '美容師' },
  { id: 'PENATA RIAS', label: 'Penata Rias', jp: 'メイクアップアーティスト' },
  { id: 'PENATA BUSANA', label: 'Penata Busana', jp: '衣装コーディネーター' },
  { id: 'MEKANIK', label: 'Mekanik', jp: '機械工' },
  { id: 'TUKANG GIGI', label: 'Tukang Gigi', jp: '歯科技工士' },
  { id: 'SENIMAN', label: 'Seniman', jp: '芸術家' },
  { id: 'TABIB', label: 'Tabib', jp: '民間医療師' },
  { id: 'PARAJI', label: 'Paraji', jp: '伝統助産師' },
  { id: 'PERANCANG BUSANA', label: 'Perancang Busana', jp: 'ファッションデザイナー' },
  { id: 'PENTERJEMAH', label: 'Penterjemah', jp: '通訳・翻訳者' },
  { id: 'IMAM MASJID', label: 'Imam Masjid', jp: 'イマーム' },
  { id: 'PENDETA', label: 'Pendeta', jp: 'プロテスタント牧師' },
  { id: 'PASTUR', label: 'Pastur', jp: 'カトリック司祭' },
  { id: 'WARTAWAN', label: 'Wartawan', jp: '記者' },
  { id: 'USTADZ/MUBALIGH', label: 'Ustadz/Mubaligh', jp: 'イスラーム宣教師', aliases: ['USTADZ / MUBALIGH'] },
  { id: 'JURU MASAK', label: 'Juru Masak', jp: '調理師' },
  { id: 'PROMOTOR ACARA', label: 'Promotor Acara', jp: 'イベントプロモーター' },
  { id: 'ANGGOTA DPR-RI', label: 'Anggota DPR-RI', jp: '国会議員（衆議院）', aliases: ['ANGGOTA DPR RI'] },
  { id: 'ANGGOTA DPD', label: 'Anggota DPD', jp: '国会議員（地域代表議院）' },
  { id: 'ANGGOTA BPK', label: 'Anggota BPK', jp: '会計検査院議員' },
  { id: 'PRESIDEN', label: 'Presiden', jp: '大統領' },
  { id: 'WAKIL PRESIDEN', label: 'Wakil Presiden', jp: '副大統領' },
  { id: 'ANGGOTA MAHKAMAH KONSTITUSI', label: 'Anggota Mahkamah Konstitusi', jp: '憲法裁判所判事' },
  { id: 'ANGGOTA KABINET/KEMENTERIAN', label: 'Anggota Kabinet/Kementerian', jp: '閣僚・省庁官僚', aliases: ['ANGGOTA KABINET / KEMENTERIAN'] },
  { id: 'DUTA BESAR', label: 'Duta Besar', jp: '大使' },
  { id: 'GUBERNUR', label: 'Gubernur', jp: '知事' },
  { id: 'WAKIL GUBERNUR', label: 'Wakil Gubernur', jp: '副知事' },
  { id: 'BUPATI', label: 'Bupati', jp: '県知事' },
  { id: 'WAKIL BUPATI', label: 'Wakil Bupati', jp: '副県知事' },
  { id: 'WALIKOTA', label: 'Walikota', jp: '市長', aliases: ['WALI KOTA'] },
  { id: 'WAKIL WALIKOTA', label: 'Wakil Walikota', jp: '副市長', aliases: ['WAKIL WALI KOTA'] },
  { id: 'ANGGOTA DPRD PROPINSI', label: 'Anggota DPRD Propinsi', jp: '州議会議員' },
  { id: 'ANGGOTA DPRD KABUPATEN/KOTA', label: 'Anggota DPRD Kabupaten/Kota', jp: '県・市議会議員', aliases: ['ANGGOTA DPRD KABUPATEN / KOTA'] },
  { id: 'DOSEN', label: 'Dosen', jp: '大学教授' },
  { id: 'GURU', label: 'Guru', jp: '教師' },
  { id: 'PILOT', label: 'Pilot', jp: 'パイロット' },
  { id: 'PENGACARA', label: 'Pengacara', jp: '弁護士' },
  { id: 'NOTARIS', label: 'Notaris', jp: '公証人' },
  { id: 'ARSITEK', label: 'Arsitek', jp: '建築士' },
  { id: 'AKUNTAN', label: 'Akuntan', jp: '会計士' },
  { id: 'KONSULTAN', label: 'Konsultan', jp: 'コンサルタント' },
  { id: 'DOKTER', label: 'Dokter', jp: '医師' },
  { id: 'BIDAN', label: 'Bidan', jp: '助産師' },
  { id: 'PERAWAT', label: 'Perawat', jp: '看護師' },
  { id: 'APOTEKER', label: 'Apoteker', jp: '薬剤師' },
  { id: 'PSIKIATER/PSIKOLOG', label: 'Psikiater/Psikolog', jp: '精神科医・心理士', aliases: ['PSIKIATER / PSIKOLOG'] },
  { id: 'PENYIAR TELEVISI', label: 'Penyiar Televisi', jp: 'テレビアナウンサー' },
  { id: 'PENYIAR RADIO', label: 'Penyiar Radio', jp: 'ラジオアナウンサー' },
  { id: 'PELAUT', label: 'Pelaut', jp: '船員' },
  { id: 'PENELITI', label: 'Peneliti', jp: '研究者' },
  { id: 'SOPIR', label: 'Sopir', jp: '運転手', aliases: ['SUPIR'] },
  { id: 'PIALANG', label: 'Pialang', jp: '仲介業' },
  { id: 'PARANORMAL', label: 'Paranormal', jp: '霊能者' },
  { id: 'PEDAGANG', label: 'Pedagang', jp: '商人・小売' },
  { id: 'PERANGKAT DESA', label: 'Perangkat Desa', jp: '村役人' },
  { id: 'KEPALA DESA', label: 'Kepala Desa', jp: '村長' },
  { id: 'BIARAWATI', label: 'Biarawati', jp: '修道女' },
  { id: 'WIRASWASTA', label: 'Wiraswasta', jp: '自営業' },
  { id: 'ANGGOTA LEMBAGA TINGGI', label: 'Anggota Lembaga Tinggi', jp: '高級機関構成員' },
  { id: 'ARTIS', label: 'Artis', jp: '芸能人' },
  { id: 'ATLIT', label: 'Atlit', jp: 'アスリート', aliases: ['ATLET'] },
  { id: 'KOKI', label: 'Koki/Cheff', jp: 'シェフ', aliases: ['CHEFF', 'CHEF', 'KOKI/CHEFF'] },
  { id: 'MANAJER', label: 'Manajer', jp: 'マネージャー' },
  { id: 'TENAGA TATA USAHA', label: 'Tenaga Tata Usaha', jp: '事務職' },
  { id: 'OPERATOR', label: 'Operator', jp: 'オペレーター' },
  {
    id: 'PEKERJA PENGOLAHAN, KERAJINAN',
    label: 'Pekerja Pengolahan, Kerajinan',
    jp: '加工・クラフト職',
    aliases: ['PEKERJA PENGOLAHAN KERAJINAN'],
  },
  { id: 'TEKNISI', label: 'Teknisi', jp: '技術者' },
  { id: 'ASISTEN AHLI', label: 'Asisten Ahli', jp: '専門アシスタント' },
  { id: 'LAINNYA', label: 'Lainnya', jp: 'その他', aliases: ['LAINNYA.', 'LAIN-LAIN'] },
];

const ID_LOOKUP = new Map<string, string>();
const JP_LOOKUP = new Map<string, string>();

/** Longest-first for substring matching. */
const MATCH_TERMS: { term: string; id: string }[] = [];

for (const opt of KK_OCCUPATION_OPTIONS) {
  ID_LOOKUP.set(opt.id.toUpperCase(), opt.id);
  JP_LOOKUP.set(opt.jp, opt.id);
  MATCH_TERMS.push({ term: opt.id, id: opt.id });
  for (const alias of opt.aliases ?? []) {
    ID_LOOKUP.set(alias.toUpperCase(), opt.id);
    MATCH_TERMS.push({ term: alias, id: opt.id });
  }
}

MATCH_TERMS.sort((a, b) => b.term.length - a.term.length);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termToPattern(term: string): string {
  const escaped = escapeRegex(term).replace(/\\\//g, '\\s*/\\s*').replace(/\s+/g, '\\s+');
  return `(?<![A-Z])${escaped}(?![A-Z])`;
}

/** Normalize OCR / legacy occupation text to canonical KK `id`. */
export function normalizeOccupationId(raw: string): string {
  if (!raw?.trim()) return '';
  const upper = raw.trim().toUpperCase().replace(/\s+/g, ' ');

  const direct = ID_LOOKUP.get(upper);
  if (direct) return direct;

  const compact = upper.replace(/[^A-Z0-9/,]/g, '');
  for (const [key, id] of ID_LOOKUP) {
    if (key.replace(/[^A-Z0-9/,]/g, '') === compact) return id;
  }

  if (upper.includes('BELUM') && upper.includes('BEKERJA')) return 'BELUM/TIDAK BEKERJA';
  if (upper.includes('TIDAK') && upper.includes('BEKERJA')) return 'BELUM/TIDAK BEKERJA';
  if (upper.includes('MENGURUS') && upper.includes('RUMAH')) return 'MENGURUS RUMAH TANGGA';
  if (upper.includes('PELAJAR') || upper.includes('MAHASISWA')) return 'PELAJAR/MAHASISWA';
  if (upper === 'TNI' || upper.includes('TNI/POLRI')) return 'TENTARA NASIONAL INDONESIA';
  if (upper.includes('POLRI')) return 'KEPOLISIAN RI';

  for (const { term, id } of MATCH_TERMS) {
    const re = new RegExp(termToPattern(term), 'i');
    if (re.test(upper)) return id;
  }

  return raw.trim();
}

function termToInterleavedPattern(term: string): string {
  const parts = term.split(/[\/\s]+/).filter((p) => p.length > 1);
  if (parts.length < 2) return termToPattern(term);
  const first = escapeRegex(parts[0]);
  const last = escapeRegex(parts[parts.length - 1]);
  return `(?<![A-Z])${first}[\\sA-Z/]*?${last}(?![A-Z])`;
}

/** Find nth occupation match inside OCR context (0-based). */
export function matchOccupationInText(text: string, index: number): string {
  const upper = text.toUpperCase();
  const hits: { start: number; id: string }[] = [];

  for (const { term, id } of MATCH_TERMS) {
    const re = new RegExp(termToInterleavedPattern(term), 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(upper)) !== null) {
      hits.push({ start: m.index, id });
    }
  }

  hits.sort((a, b) => a.start - b.start);

  const seen = new Set<number>();
  const unique: string[] = [];
  for (const h of hits) {
    if (seen.has(h.start)) continue;
    seen.add(h.start);
    unique.push(h.id);
  }

  return unique[index] ?? '';
}

export function occupationIdToJp(id: string): string {
  const canon = normalizeOccupationId(id);
  const opt = KK_OCCUPATION_OPTIONS.find((o) => o.id === canon);
  if (opt) return opt.jp;
  if (JP_LOOKUP.has(id.trim())) return id.trim();
  return id;
}

export function occupationJpToId(jp: string): string {
  if (!jp?.trim()) return '';
  const direct = JP_LOOKUP.get(jp.trim());
  if (direct) return direct;

  for (const opt of KK_OCCUPATION_OPTIONS) {
    if (opt.jp === jp.trim()) return opt.id;
  }

  // Legacy JP labels from older dropdown
  const legacy: Record<string, string> = {
    未就労: 'BELUM/TIDAK BEKERJA',
    家事: 'MENGURUS RUMAH TANGGA',
    主婦: 'MENGURUS RUMAH TANGGA',
    定年: 'PENSIUNAN',
    公務員: 'PEGAWAI NEGERI SIPIL',
    軍人: 'TENTARA NASIONAL INDONESIA',
    農家: 'PETANI/PEKEBUN',
    畜産: 'PETERNAK',
    会社員: 'KARYAWAN SWASTA',
    アルバイト: 'BURUH HARIAN LEPAS',
    農民: 'BURUH TANI/PERKEBUNAN',
    家事手伝い: 'PEMBANTU RUMAH TANGGA',
    学生: 'PELAJAR/MAHASISWA',
    理容師: 'TUKANG CUKUR',
    電気技師: 'TUKANG LISTRIK',
    石工: 'TUKANG BATU',
    大工: 'TUKANG KAYU',
    記者: 'WARTAWAN',
    牧師: 'USTADZ/MUBALIGH',
    教師: 'GURU',
    運転手: 'SOPIR',
    商人: 'PEDAGANG',
    役人: 'PERANGKAT DESA',
    村長: 'KEPALA DESA',
    自営業: 'WIRASWASTA',
    その他: 'LAINNYA',
  };

  return legacy[jp.trim()] ?? jp.trim();
}
