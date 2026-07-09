import { toKatakana } from '@/lib/katakana-master';
import { educationIdToJp, educationJpToId } from './educationOptions';
import { occupationIdToJp, occupationJpToId } from './occupationOptions';
import {
  findRelationshipOption,
} from './relationshipOptions';
import { translateRegionToJp } from './regionTranslations';

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
    const opt = findRelationshipOption(cleanVal);
    if (opt) {
      if (opt.custom) return val.trim();
      return opt.jp;
    }
    // Legacy / OCR aliases
    if (cleanVal.includes('KEPALA KELUARGA') || cleanVal === 'KEPALA' || cleanVal === '世帯主' || cleanVal === '家長') return '世帯主';
    if (cleanVal.includes('SUAMI') || cleanVal === 'HUSBAND') return '夫';
    if (cleanVal.includes('ISTRI') || cleanVal === 'WIFE') return '妻';
    if (cleanVal.includes('ANAK') || cleanVal === 'CHILD' || cleanVal === '子供') return '子';
    if (cleanVal.includes('MENANTU')) return '婿・嫁';
    if (cleanVal.includes('CUCU')) return '孫';
    if (cleanVal.includes('ORANG TUA') || cleanVal.includes('ORANGTUA') || cleanVal === 'AYAH' || cleanVal === 'IBU') return '父母';
    if (cleanVal.includes('MERTUA')) return '義父母';
    if (cleanVal.includes('FAMILI LAIN')) return 'その他の親族';
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
    return educationIdToJp(val);
  }

  if (field === 'occupation') {
    return occupationIdToJp(val);
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
    const opt = findRelationshipOption(cleanVal);
    if (opt && !opt.custom) return opt.id;
    if (cleanVal.includes('世帯主') || cleanVal.includes('家長')) return 'KEPALA KELUARGA';
    if (cleanVal.includes('夫')) return 'SUAMI';
    if (cleanVal.includes('妻')) return 'ISTRI';
    if (cleanVal === '子' || cleanVal.includes('子供')) return 'ANAK';
    if (cleanVal.includes('婿') || cleanVal.includes('嫁')) return 'MENANTU';
    if (cleanVal.includes('孫')) return 'CUCU';
    if (cleanVal.includes('父母') || cleanVal.includes('両親')) return 'ORANG TUA';
    if (cleanVal.includes('義父母') || cleanVal.includes('義理の親')) return 'MERTUA';
    if (cleanVal.includes('その他の親族') || cleanVal.includes('他の家族')) return 'FAMILI LAIN';
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
    return educationJpToId(val);
  }

  if (field === 'occupation') {
    return occupationJpToId(val);
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

const BASIC_REGION_FIELDS = new Set(['kelurahan', 'kecamatan', 'kabKota', 'provinsi', 'alamat']);

/** Sinkronkan nilai field basic ID → JP saat edit versi Indonesia */
export function syncBasicFieldIdToJp(field: string, value: string): string {
  if (BASIC_REGION_FIELDS.has(field)) {
    return translateRegionToJp(value);
  }
  return keepRomanji(value);
}

/** @deprecated use syncBasicFieldIdToJp */
export function syncBasicIdToJp(value: string): string {
  return keepRomanji(value);
}
