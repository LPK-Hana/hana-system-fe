import { toKatakana } from '@/lib/katakana-master';

/** Konversi nama/teks Indonesia ke Katakana (Katakana Master) */
export const translateToKatakana = (text: string): string => {
  if (!text) return '';
  return toKatakana(text);
};

/** Teks tetap romaji (uppercase) — tidak dikonversi ke katakana / kanji JP */
export const keepRomanji = (text: string): string => {
  if (!text) return '';
  return text.trim().toUpperCase();
};

/** Nilai JP untuk field yang tidak perlu katakana (pakai override JP atau romaji dari ID) */
export function resolveJpRomanjiField(jpValue: string | undefined, idValue: string): string {
  if (jpValue !== undefined && jpValue !== '') return jpValue;
  return keepRomanji(idValue);
}

// Fungsi khusus untuk mengonversi Provinsi
export const translateProvinceToJp = (prov: string) => {
  if (!prov) return '';
  let clean = prov.toUpperCase();

  // 4. Koreksi Noise dan kata "PROVINSI" / "PROV"
  clean = clean.replace(/PROVINSI|PROV\.|PROV/g, '').trim();
  clean = clean.replace(/JAW4/g, 'JAWA').replace(/DK1/g, 'DKI').replace(/T1MUR/g, 'TIMUR');

  return clean;
};

/** Nilai enum JP: terjemahkan dari nilai JP tersimpan atau fallback ID (data lama bisa masih bahasa Indonesia). */
export function resolveJpEnumField(
  jpValue: string | undefined,
  idValue: string,
  field: string,
): string {
  const raw = (jpValue && jpValue.trim()) || (idValue && idValue.trim()) || '';
  if (!raw) return '';
  return translateToJp(field, raw);
}

export const translateToJp = (field: string, val: string) => {
  if (!val) return '';
  const cleanVal = val.trim().toUpperCase();

  if (field === 'gender') {
    if (cleanVal === 'L' || cleanVal.includes('LAKI') || cleanVal === '男性' || cleanVal === '男' || cleanVal === 'MALE') return '男';
    if (cleanVal === 'P' || cleanVal.includes('PEREMPUAN') || cleanVal === '女性' || cleanVal === '女' || cleanVal === 'FEMALE') return '女';
    return val;
  }

  if (field === 'religion') {
    if (cleanVal.includes('ISLAM')) return 'イスラム教';
    if (cleanVal.includes('KATOLIK') || cleanVal.includes('KATHOLIK')) return 'カトリック';
    if (cleanVal.includes('KRISTEN') || cleanVal.includes('PROTESTAN')) return 'キリスト教';
    if (cleanVal.includes('HINDU')) return 'ヒンドゥー教';
    if (cleanVal.includes('BUDHA') || cleanVal.includes('BUDDHA')) return '仏教';
    if (cleanVal.includes('KONGHUCU') || cleanVal.includes('CONFUCIUS')) return '儒教';
    return val;
  }

  if (field === 'bloodType') {
    if (cleanVal === 'A') return 'A型';
    if (cleanVal === 'B') return 'B型';
    if (cleanVal === 'AB') return 'AB型';
    if (cleanVal === 'O') return 'O型';
    if (cleanVal.includes('TIDAK TAHU') || cleanVal.includes('TIDAK DIKETAHUI') || cleanVal === 'UNKNOWN' || cleanVal === '未定') return '未定';
    return val;
  }

  if (field === 'maritalStatus') {
    if (cleanVal.includes('BELUM KAWIN') || cleanVal.includes('BELUM NIKAH') || cleanVal === 'SINGLE') return '未婚';
    if (cleanVal.includes('KAWIN') || cleanVal.includes('MENIKAH') || cleanVal === 'MARRIED') return '既婚';
    if (cleanVal.includes('CERAI HIDUP') || cleanVal.includes('DUDU')) return '離婚';
    if (cleanVal.includes('CERAI MATI')) return '死別';
    return val;
  }

  if (field === 'relationship') {
    if (cleanVal.includes('KEPALA KELUARGA') || cleanVal === 'KEPALA' || cleanVal === '世帯主' || cleanVal === '家長') return '家長';
    if (cleanVal.includes('SUAMI') || cleanVal === 'HUSBAND') return '夫';
    if (cleanVal.includes('ISTRI') || cleanVal === 'WIFE') return '妻';
    if (cleanVal.includes('ANAK') || cleanVal === 'CHILD' || cleanVal === '子供') return '子供';
    if (cleanVal.includes('MENANTU')) return '義理の子';
    if (cleanVal.includes('CUCU')) return '孫';
    if (cleanVal.includes('ORANG TUA') || cleanVal.includes('ORANGTUA') || cleanVal === 'AYAH' || cleanVal === 'IBU') return '両親';
    if (cleanVal.includes('MERTUA')) return '義理の親';
    if (cleanVal.includes('FAMILI LAIN')) return '他の家族';
    if (cleanVal.includes('PEMBANTU')) return '使用人';
    if (cleanVal.includes('LAINNYA')) return 'その他';
    return val;
  }

  if (field === 'nationality') {
    if (cleanVal === 'WNI' || cleanVal.includes('INDONESIA')) return 'インドネシア';
    if (cleanVal === 'WNA') return '外国籍';
    return val;
  }

  if (field === 'education') {
    if (cleanVal === 'BELUM SEKOLAH' || cleanVal.includes('BELUM MASUK')) return '未就学';
    if (cleanVal.includes('TIDAK') && cleanVal.includes('SEKOLAH') || cleanVal.includes('BELUM SEKOLAH') || cleanVal.includes('学歴なし')) return '学歴なし';
    if (cleanVal.includes('BELUM TAMAT SD')) return '小学校未卒';
    if (cleanVal.includes('TAMAT SD') || cleanVal === 'SD/SEDERAJAT') return '小学校卒業';
    if (cleanVal.includes('SLTP') || cleanVal.includes('SMP')) return '中学校卒業';
    if (cleanVal.includes('SLTA') || cleanVal.includes('SMA')) return '高校卒業';
    if (cleanVal.includes('DIPLOMA I') || cleanVal.includes('DIPLOMA II') || cleanVal.includes('D1') || cleanVal.includes('D2')) return '短大';
    if (cleanVal.includes('AKADEMI') || cleanVal.includes('DIPLOMA III') || cleanVal.includes('SARJANA MUDA') || cleanVal.includes('D3')) return '専門学校';
    if (cleanVal.includes('DIPLOMA IV') || cleanVal.includes('STRATA I') || cleanVal.includes('S1')) return '大学';
    if (cleanVal.includes('STRATA II') || cleanVal.includes('S2')) return '大学院';
    if (cleanVal.includes('STRATA III') || cleanVal.includes('S3')) return '博士課程';
    return val;
  }

  if (field === 'occupation') {
    if (cleanVal.includes('BELUM') && cleanVal.includes('BEKERJA') || cleanVal.includes('TIDAK BEKERJA')) return '未就労';
    if (cleanVal.includes('MENGURUS RUMAH TANGGA')) return '家事';
    if (cleanVal.includes('PENSIUNAN')) return '定年';
    if (cleanVal.includes('PEGAWAI NEGERI SIPIL') || cleanVal === 'PNS') return '公務員';
    if (cleanVal.includes('TENTARA') || cleanVal === 'TNI' || cleanVal === 'POLRI') return '軍人';
    if (cleanVal.includes('PETANI') || cleanVal.includes('PEKEBUN')) return '農家';
    if (cleanVal.includes('PETERNAK')) return '畜産';
    if (cleanVal.includes('KARYAWAN SWASTA')) return '会社員';
    if (cleanVal.includes('BURUH HARIAN LEPAS')) return 'アルバイト';
    if (cleanVal.includes('BURUH TANI') || cleanVal.includes('PERKEBUNAN')) return '農民';
    if (cleanVal.includes('PEMBANTU RUMAH TANGGA') || cleanVal.includes('PRT')) return '家事手伝い';
    if (cleanVal.includes('PELAJAR') || cleanVal.includes('MAHASISWA')) return '学生';
    if (cleanVal.includes('TUKANG CUKUR')) return '理容師';
    if (cleanVal.includes('TUKANG LISTRIK')) return '電気技師';
    if (cleanVal.includes('TUKANG BATU')) return '石工';
    if (cleanVal.includes('TUKANG KAYU')) return '大工';
    if (cleanVal.includes('WARTAWAN')) return '記者';
    if (cleanVal.includes('USTADZ') || cleanVal.includes('MUBALIGH')) return '牧師';
    if (cleanVal.includes('GURU')) return '教師';
    if (cleanVal.includes('SOPIR') || cleanVal.includes('SUPIR')) return '運転手';
    if (cleanVal.includes('PEDAGANG')) return '商人';
    if (cleanVal.includes('PERANGKAT DESA')) return '役人';
    if (cleanVal.includes('KEPALA DESA')) return '村長';
    if (cleanVal.includes('WIRASWASTA')) return '自営業';
    return val;
  }

  return val;
};

export const translateToId = (field: string, val: string) => {
  if (!val) return '';
  const cleanVal = val.trim().toUpperCase();

  if (field === 'gender') {
    if (cleanVal === '男性' || cleanVal === '男' || cleanVal === 'L' || cleanVal.includes('LAKI') || cleanVal === 'MALE') return 'L';
    if (cleanVal === '女性' || cleanVal === '女' || cleanVal === 'P' || cleanVal.includes('PEREMPUAN') || cleanVal === 'FEMALE') return 'P';
    return val;
  }

  if (field === 'religion') {
    if (cleanVal.includes('イスラム')) return 'ISLAM';
    if (cleanVal.includes('カトリック')) return 'KATOLIK';
    if (cleanVal.includes('キリスト')) return 'KRISTEN';
    if (cleanVal.includes('ヒンドゥー')) return 'HINDU';
    if (cleanVal.includes('仏教') || cleanVal.includes('ブッダ')) return 'BUDDHA';
    if (cleanVal.includes('儒教')) return 'KONGHUCU';
    return val;
  }

  if (field === 'bloodType') {
    if (cleanVal === 'A型') return 'A';
    if (cleanVal === 'B型') return 'B';
    if (cleanVal === 'AB型') return 'AB';
    if (cleanVal === 'O型') return 'O';
    if (cleanVal === '不明' || cleanVal === '未定') return 'TIDAK TAHU';
    return val;
  }

  if (field === 'maritalStatus') {
    if (cleanVal.includes('未婚') || cleanVal === 'SINGLE') return 'BELUM KAWIN';
    if (cleanVal.includes('既婚') || cleanVal === 'MARRIED') return 'KAWIN';
    if (cleanVal.includes('離婚')) return 'CERAI HIDUP';
    if (cleanVal.includes('死別')) return 'CERAI MATI';
    return val;
  }

  if (field === 'relationship') {
    if (cleanVal.includes('世帯主') || cleanVal.includes('家長')) return 'KEPALA KELUARGA';
    if (cleanVal.includes('夫')) return 'SUAMI';
    if (cleanVal.includes('妻')) return 'ISTRI';
    if (cleanVal.includes('子')) return 'ANAK';
    if (cleanVal.includes('義理の親') || cleanVal.includes('義親')) return 'MERTUA';
    if (cleanVal.includes('両親') || cleanVal.includes('親')) return 'ORANG TUA';
    if (cleanVal.includes('義理の子')) return 'MENANTU';
    if (cleanVal.includes('孫')) return 'CUCU';
    if (cleanVal.includes('他の家族') || cleanVal.includes('親族')) return 'FAMILI LAIN';
    if (cleanVal.includes('使用人') || cleanVal.includes('雇人')) return 'PEMBANTU';
    if (cleanVal.includes('その他')) return 'LAINNYA';
    return val;
  }

  if (field === 'nationality') {
    if (cleanVal.includes('インドネシア') || cleanVal === 'WNI') return 'WNI';
    if (cleanVal.includes('外国籍') || cleanVal === 'WNA') return 'WNA';
    return val;
  }

  if (field === 'education') {
    if (cleanVal === '未就学') return 'BELUM SEKOLAH';
    if (cleanVal === '学歴なし') return 'TIDAK/BELUM SEKOLAH';
    if (cleanVal === '小学校未卒') return 'BELUM TAMAT SD/SEDERAJAT';
    if (cleanVal === '小学校卒業') return 'TAMAT SD/SEDERAJAT';
    if (cleanVal === '中学校卒業') return 'SLTP/SEDERAJAT';
    if (cleanVal === '高校卒業') return 'SLTA/SEDERAJAT';
    if (cleanVal === '短大') return 'DIPLOMA I/II';
    if (cleanVal === '専門学校') return 'AKADEMI/DIPLOMA III';
    if (cleanVal === '大学') return 'S1/DIV';
    if (cleanVal === '大学院') return 'STRATA II';
    if (cleanVal === '博士課程') return 'STRATA III';
    return val;
  }

  if (field === 'occupation') {
    if (cleanVal === '未就労') return 'BELUM/TIDAK BEKERJA';
    if (cleanVal === '家事' || cleanVal === '主婦') return 'MENGURUS RUMAH TANGGA';
    if (cleanVal === '定年') return 'PENSIUNAN';
    if (cleanVal === '公務員') return 'PEGAWAI NEGERI SIPIL';
    if (cleanVal === '軍人') return 'TNI';
    if (cleanVal === '農家') return 'PETANI/PEKEBUN';
    if (cleanVal === '畜産') return 'PETERNAK';
    if (cleanVal === '会社員') return 'KARYAWAN SWASTA';
    if (cleanVal === 'アルバイト') return 'BURUH HARIAN LEPAS';
    if (cleanVal === '農民') return 'BURUH TANI/PERKEBUNAN';
    if (cleanVal === '家事手伝い') return 'PEMBANTU RUMAH TANGGA';
    if (cleanVal === '学生') return 'PELAJAR/MAHASISWA';
    if (cleanVal === '理容師') return 'TUKANG CUKUR';
    if (cleanVal === '電気技師') return 'TUKANG LISTRIK';
    if (cleanVal === '石工') return 'TUKANG BATU';
    if (cleanVal === '大工') return 'TUKANG KAYU';
    if (cleanVal === '記者') return 'WARTAWAN';
    if (cleanVal === '牧師') return 'USTADZ/MUBALIGH';
    if (cleanVal === '教師') return 'GURU';
    if (cleanVal === '運転手') return 'SOPIR';
    if (cleanVal === '商人') return 'PEDAGANG';
    if (cleanVal === '役人') return 'PERANGKAT DESA';
    if (cleanVal === '村長') return 'KEPALA DESA';
    if (cleanVal === '自営業') return 'WIRASWASTA';
    return val;
  }

  return val;
};

const MEMBER_FIELDS_WITH_JP_TRANSLATE = new Set([
  'gender',
  'religion',
  'bloodType',
  'maritalStatus',
  'education',
  'occupation',
  'nationality',
  'relationship',
]);

/** Sinkronkan nilai field ID → JP saat edit versi Indonesia (preview JP ikut berubah). */
export function syncMemberIdToJp(idField: string, value: string): string {
  const upper = value.trim().toUpperCase();
  if (!upper) return '';
  if (MEMBER_FIELDS_WITH_JP_TRANSLATE.has(idField)) {
    return translateToJp(idField, upper);
  }
  return keepRomanji(upper);
}

export function syncBasicIdToJp(value: string): string {
  return keepRomanji(value);
}
