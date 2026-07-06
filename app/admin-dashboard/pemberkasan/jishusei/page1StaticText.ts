/** Teks statis di-scrape dari TEMPLATE DOKUMEN JISHUSEI.pdf halaman 1 */

export const PAGE1_STATIC = {
  headerRefJa:
    '参考様式第１-３号（規則第８条第４号関係）                   （日本産業規格Ａ列４）',
  headerRefId:
    'Rujukan Formulir Nomor 1-3 (Berhubungan dengan Peraturan Pasal 8 Nomor 4)                (Standar Industri Jepang ukuran A4)',
  categories: 'Ａ・Ｂ・Ｃ・Ｄ・Ｅ・Ｆ',
  titleChars: ['技', '能', '実', '習', '生', 'の', '履', '歴', '書'],
  titleId: 'Riwayat Hidup Peserta Pemagangan Teknis',
  dateCreatedJa: '年      月    日  作成',
  dateCreatedId: 'Dibuat  Thn.             Bln.          Tgl.',

  name: { ja: '①氏名', id1: 'Nama', id2: 'lengkap' },
  romaji: { ja: 'ローマ字', id: 'Huruf Romawi' },
  kanji: { ja: '漢字', id: 'Kanji' },
  gender: { ja: '②性別', id: 'Jenis kelamin', idOptions: 'Laki-laki ・ Perempuan' },
  birth: { ja: '③生年月日', id: 'Tanggal lahir' },
  nationality: { ja: '④国籍（国又は地域）', id1: 'Kewarganegaraan', id2: '(Negara/Wilayah)' },
  motherTongue: { ja: '⑤母国語', id: 'Bahasa Ibu' },
  address: { ja: '⑥現住所', id: 'Alamat Sekarang' },

  education: { ja: '⑦学歴', id: 'Pendidikan' },
  eduHeaderPeriod: '期間 Jangka Waktu',
  eduHeaderSchool: '学校名 Nama Sekolah',

  work: { ja: '⑧職歴', id: 'Pengalaman Kerja' },
  workHeaderPeriod: '期間 Jangka Waktu',
  workHeaderCompany: '就職先名（職種）Nama Perusahaan (Jenis Pekerjaan)',

  relatedSkill: {
    ja1: '⑨修得等をしようとす',
    ja2: 'る技能等に係る職歴',
    id1: 'Pengalaman kerja yang',
    id2: 'berhubungan dengan',
    id3: 'keterampilan yang akan',
    id4: 'diperoleh saat magang',
    rightJa: '職                    年',
    rightId: 'Jenis pekerjaan                             tahun',
  },

  japanVisit: {
    ja: '⑩訪日経験',
    id1: 'Pengalaman kedatangan',
    id2: 'di Jepang',
    adaId:
      'Ada             * Status tinggal: pemagangan teknis・Selain pemagangan teknis   Tidak ada',
    constructionJa:
      '☐ 外国人建設・造船就労者受入事業により本邦で就労したことがある場合',
    constructionId1:
      'Jika pernah bekerja di Jepang dalam program penerimaan pekerja asing untuk konstruksi dan',
    constructionId2: 'pembuatan kapal.',
    return2Ja: '第２号技能実習終了後の帰国期間（  年  月  日 ～  年  月  日）',
    return2Id: 'Masa pulang ke negara asal setelah selesai pemagangan teknis nomor 2',
    return2Date: '(Thn.      Bln.     Tgl.     s/d  Thn.      Bln.      Tgl.     )',
    returnConstJa: '建設・造船就労終了後の帰国期間（  年  月  日 ～  年  月  日）',
    returnConstId:
      'Masa pulang ke negara asal setelah selesai bekerja di program konstruksi dan pembuatan kapal',
    returnConstDate: '(Thn.      Bln.     Tgl.     s/d  Thn.      Bln.      Tgl.     )',
  },
} as const;

export const EDU_ROW_COUNT = 3;
export const WORK_ROW_COUNT = 3;
