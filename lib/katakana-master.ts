/**
 * KATAKANA MASTER — Indonesian → Katakana transliterator
 *
 * Optimized for Indonesian personal names (including old orthography:
 * oe→u, tj→c, dj→j, sj→sy, adji→aji, etc.)
 */

// ── Romaji → Katakana (longest match first) ───────────────────────────────
const ROMAJI_TO_KATAKANA: [string, string][] = [
  // Loanword / name fragments
  ['yuro', 'ユーロ'],
  ['chell', 'チェル'],
  ['cell', 'セル'],
  ['sch', 'シュ'],
  ['dwi', 'ドウィ'],
  ['tri', 'トリ'],
  ['tre', 'トレ'],
  ['tra', 'トラ'],
  ['tro', 'トロ'],
  ['tru', 'トル'],
  ['rey', 'レイ'],
  ['mar', 'マー'],
  ['har', 'ハー'],
  ['aji', 'アジ'],
  ['ngg', 'ング'],

  // Diphthongs & long vowels
  ['ey', 'エイ'],
  ['ay', 'アイ'],
  ['oy', 'オイ'],
  ['uy', 'ウイ'],
  ['ai', 'アイ'],
  ['au', 'アウ'],
  ['oi', 'オイ'],
  ['ee', 'イー'],
  ['oo', 'オー'],
  ['aa', 'アー'],
  ['eu', 'ユー'],
  ['ou', 'オウ'],
  ['ia', 'イア'],
  ['io', 'イオ'],
  ['iu', 'イウ'],
  ['dy', 'ディ'],
  ['ty', 'ティ'],
  ['ly', 'リ'],
  ['ll', 'ル'],
  ['nn', 'ン'],

  // SY
  ['sya', 'シャ'], ['syi', 'シ'], ['syu', 'シュ'], ['sye', 'シェ'], ['syo', 'ショ'],
  ['sha', 'シャ'], ['shi', 'シ'], ['shu', 'シュ'], ['she', 'シェ'], ['sho', 'ショ'],

  // NY
  ['nya', 'ニャ'], ['nyi', 'ニ'], ['nyu', 'ニュ'], ['nye', 'ニェ'], ['nyo', 'ニョ'],

  // CH / C (Indonesian c = ch)
  ['cha', 'チャ'], ['chi', 'チ'], ['chu', 'チュ'], ['che', 'チェ'], ['cho', 'チョ'],
  ['ca', 'チャ'], ['ci', 'チ'], ['cu', 'チュ'], ['ce', 'チェ'], ['co', 'チョ'],

  // CV pairs
  ['ka', 'カ'], ['ki', 'キ'], ['ku', 'ク'], ['ke', 'ケ'], ['ko', 'コ'],
  ['ga', 'ガ'], ['gi', 'ギ'], ['gu', 'グ'], ['ge', 'ゲ'], ['go', 'ゴ'],
  ['sa', 'サ'], ['si', 'シ'], ['su', 'ス'], ['se', 'セ'], ['so', 'ソ'],
  ['za', 'ザ'], ['zi', 'ジ'], ['zu', 'ズ'], ['ze', 'ゼ'], ['zo', 'ゾ'],
  ['ta', 'タ'], ['ti', 'チ'], ['tu', 'ツ'], ['te', 'テ'], ['to', 'ト'],
  ['da', 'ダ'], ['di', 'ディ'], ['du', 'ドゥ'], ['de', 'デ'], ['do', 'ド'],
  ['na', 'ナ'], ['ni', 'ニ'], ['nu', 'ヌ'], ['ne', 'ネ'], ['no', 'ノ'],
  ['ha', 'ハ'], ['hi', 'ヒ'], ['hu', 'フ'], ['he', 'ヘ'], ['ho', 'ホ'],
  ['fa', 'ファ'], ['fi', 'フィ'], ['fu', 'フ'], ['fe', 'フェ'], ['fo', 'フォ'],
  ['ba', 'バ'], ['bi', 'ビ'], ['bu', 'ブ'], ['be', 'ベ'], ['bo', 'ボ'],
  ['pa', 'パ'], ['pi', 'ピ'], ['pu', 'プ'], ['pe', 'ペ'], ['po', 'ポ'],
  ['ma', 'マ'], ['mi', 'ミ'], ['mu', 'ム'], ['me', 'メ'], ['mo', 'モ'],
  ['ya', 'ヤ'], ['yi', 'イ'], ['yu', 'ユ'], ['ye', 'イェ'], ['yo', 'ヨ'],
  ['ra', 'ラ'], ['ri', 'リ'], ['ru', 'ル'], ['re', 'レ'], ['ro', 'ロ'],
  ['la', 'ラ'], ['li', 'リ'], ['lu', 'ル'], ['le', 'レ'], ['lo', 'ロ'],
  ['wa', 'ワ'], ['wi', 'ウィ'], ['wu', 'ウ'], ['we', 'ウェ'], ['wo', 'ウォ'],
  ['va', 'ヴァ'], ['vi', 'ヴィ'], ['vu', 'ヴ'], ['ve', 'ヴェ'], ['vo', 'ヴォ'],
  ['ja', 'ジャ'], ['ji', 'ジ'], ['ju', 'ジュ'], ['je', 'ジェ'], ['jo', 'ジョ'],

  // Single vowels
  ['a', 'ア'], ['i', 'イ'], ['u', 'ウ'], ['e', 'エ'], ['o', 'オ'],
];

const CODA_MAP: Record<string, string> = {
  g: 'グ',
  k: 'ク',
  r: 'ル',
  l: 'ル',
  m: 'ム',
  s: 'ス',
  p: 'プ',
  b: 'ブ',
  f: 'フ',
  v: 'ヴ',
  t: 'ト',
  d: 'ド',
  z: 'ズ',
  c: 'ク',
  x: 'クス',
  q: 'ク',
  w: 'ウ',
  y: 'イ',
  h: '',
  j: 'ジ',
  n: 'ン',
};

/** Old / Dutch-influenced Indonesian spelling → modern phonetic form */
function preprocessIndonesianOrthography(word: string): string {
  let w = word.toLowerCase();

  // Trigraf / digraf kuno (order matters)
  w = w.replace(/oe/g, 'u');
  w = w.replace(/tj/g, 'c');
  w = w.replace(/dj/g, 'j');
  w = w.replace(/sj/g, 'sy');
  w = w.replace(/nj(?=[aeiou])/g, 'ny');
  w = w.replace(/ph/g, 'f');
  w = w.replace(/qu/g, 'kw');
  w = w.replace(/ck/g, 'k');

  // Suffix / cluster khas nama Indonesia
  w = w.replace(/adji\b/g, 'aji');
  w = w.replace(/adj(?=[aeiou])/g, 'aj');
  w = w.replace(/dji\b/g, 'ji');
  w = w.replace(/dja/g, 'ja');
  w = w.replace(/djo/g, 'jo');
  w = w.replace(/dju/g, 'ju');

  // eu sering dibaca "yu" di nama (yurop → euro)
  w = w.replace(/^yur(?=[aeiou])/g, 'yur');

  return w;
}

function fixOcrNoise(input: string): string {
  return input
    .replace(/\b1([a-z])/gi, 'I$1')
    .replace(/([a-z])0([a-z])/gi, '$1O$2')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalize(word: string): string {
  return preprocessIndonesianOrthography(word).replace(/[^a-z]/g, '');
}

function translateWord(raw: string): string {
  const word = normalize(raw);
  if (!word) return raw;

  let result = '';
  let i = 0;

  while (i < word.length) {
    // ng at end of word → ン
    if (word[i] === 'n' && word[i + 1] === 'g' && i + 2 >= word.length) {
      result += 'ン';
      i += 2;
      continue;
    }

    // ng before vowel → ン, then g continues
    if (word[i] === 'n' && word[i + 1] === 'g' && i + 2 < word.length && 'aeiou'.includes(word[i + 2])) {
      result += 'ン';
      i += 1;
      continue;
    }

    // n before consonant (except y/g) → ン
    if (word[i] === 'n' && i + 1 < word.length && !'aeiounyg'.includes(word[i + 1])) {
      result += 'ン';
      i += 1;
      continue;
    }

    // n at end → ン
    if (word[i] === 'n' && i + 1 >= word.length) {
      result += 'ン';
      i += 1;
      continue;
    }

    // Geminate consonant → ッ
    if (i + 1 < word.length && word[i] === word[i + 1] && !'aeiou'.includes(word[i])) {
      result += 'ッ';
      i += 1;
      continue;
    }

    // Long vowel: vowel doubled in source (after preprocess) — handled in table (aa, ee, oo)

    // y as consonant before vowel (e.g. yu→ユ, ya→ヤ) — table handles it

    let matched = false;
    for (const [rom, kata] of ROMAJI_TO_KATAKANA) {
      if (word.startsWith(rom, i)) {
        result += kata;
        i += rom.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const ch = word[i];
    const isAtEnd = i + 1 >= word.length;
    const nextIsConsonant = i + 1 < word.length && !'aeiou'.includes(word[i + 1]);

    if (!'aeiou'.includes(ch) && (isAtEnd || nextIsConsonant) && ch in CODA_MAP) {
      result += CODA_MAP[ch];
      i += 1;
      continue;
    }

    i += 1;
  }

  return result || raw;
}

function stripTitles(name: string): string {
  let clean = name.split(',')[0];
  const frontTitles = /\b(?:dr|drg|ir|prof|h|hj|drs|dra|ust|kh)\b\.?/gi;
  clean = clean.replace(frontTitles, '');
  const backTitles =
    /\b(?:S|M|Dr|Ph\.?D|Sp|Ak|Amd|SE|SH|ST|SK|SP|SIP|SKom|SIKom|SSos|SSi|SPd|SKed|SKm|SKg|SPsi|SFarm|SAg|MH|MSi|MM|MT|MKes|MPd|MAg|MSc|MAP|MKn|MBA|MPH|DRS|DRA|SOS|SHI|SHum|SPN)\.?(?:\s+|$)/gi;
  clean = clean.replace(backTitles, ' ');
  clean = clean.replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
  return clean;
}

/** Apply long-vowel ー after certain katakana when followed by consonant cluster */
function applyLongVowelMarks(kata: string): string {
  // yu at start of euro-like names: ユ → ユー before ロ
  return kata.replace(/^ユ(ロ)/, 'ユー$1');
}

/**
 * Convert Indonesian text / personal names to Katakana.
 * Words are joined with ・ (middle dot).
 */
export function toKatakana(input: string): string {
  if (!input || !input.trim()) return '';

  const cleanedName = stripTitles(input);
  if (!cleanedName) return '';

  const fixed = fixOcrNoise(cleanedName);
  const tokens = fixed.trim().split(/\s+/);

  const parts = tokens.map((token) => {
    if (!/[a-zA-Z]/.test(token)) return token;
    return applyLongVowelMarks(translateWord(token));
  });

  return parts.join('・');
}
