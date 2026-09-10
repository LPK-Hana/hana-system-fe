import React from 'react';
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { KkFormData } from '../types';
import { keepRomanji, translateToJp, translateToId } from '../utils/translations';
import { RelationshipField } from './RelationshipField';
import { PreservedTextInput } from './PreservedTextInput';
import { KK_EDUCATION_OPTIONS, normalizeEducationId } from '../utils/educationOptions';
import { KK_OCCUPATION_OPTIONS, normalizeOccupationId } from '../utils/occupationOptions';

interface EditorPanelProps {
  activeMobileTab: 'edit' | 'preview';
  isEditorCollapsed: boolean;
  activeTab: 'upload' | 'edit_id' | 'edit_jp';
  setActiveTab: (tab: 'upload' | 'edit_id' | 'edit_jp') => void;
  setViewLanguage?: (lang: 'id' | 'jp') => void;
  ocrLoading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: KkFormData;
  updateHeader: (val: string) => void;
  updateBasic: (field: string, val: string, syncJpField?: string) => void;
  updateMember: (idx: number, field: string, val: string, syncJpField?: string) => void;
  updateFooter: (field: string, val: string) => void;
  isExistingData?: boolean;
  /** When false, JP name fields show stored value only (no live auto-translate). */
  autoTranslateNames?: boolean;
}

const EDUCATION_OPTIONS = KK_EDUCATION_OPTIONS;
const OCCUPATION_OPTIONS = KK_OCCUPATION_OPTIONS;

const BLOOD_TYPE_OPTIONS = [
  { id: 'A', jp: 'A型' },
  { id: 'B', jp: 'B型' },
  { id: 'AB', jp: 'AB型' },
  { id: 'O', jp: 'O型' },
  { id: 'TIDAK TAHU', jp: '不明' },
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
  activeMobileTab,
  isEditorCollapsed,
  activeTab,
  setActiveTab,
  setViewLanguage,
  ocrLoading,
  handleFileUpload,
  formData,
  updateHeader,
  updateBasic,
  updateMember,
  updateFooter,
  isExistingData,
  autoTranslateNames = true,
}) => {
  const isJp = activeTab === 'edit_jp';

  const getBasicVal = (field: keyof typeof formData.basic, jpField?: keyof typeof formData.basic, transFn?: (v: string) => string) => {
    const val = formData.basic[field] as string;
    if (!isJp) return val;
    if (jpField && (formData.basic as any)[jpField] !== undefined && (formData.basic as any)[jpField] !== '') {
      return (formData.basic as any)[jpField];
    }
    if (!autoTranslateNames) return (jpField ? (formData.basic as any)[jpField] ?? '' : val);
    return transFn ? transFn(val) : val;
  };

  const getMemberVal = (member: any, field: string, jpField?: string, transFn?: any, jpFieldType?: string) => {
    const val = member[field] as string;
    if (!isJp) return val;
    if (jpField && member[jpField] !== undefined && member[jpField] !== '') return member[jpField];
    if (!autoTranslateNames) return jpField ? (member[jpField] ?? '') : val;
    if (transFn && jpFieldType) return transFn(jpFieldType, val);
    if (transFn) return transFn(val);
    return val;
  };

  const handleBasicChange = (field: string, jpField: string, val: string) => {
    if (isJp) {
      updateBasic(jpField, val);
      return;
    }
    updateBasic(field, val, jpField);
  };

  const handleMemberChange = (idx: number, field: string, jpField: string, val: string) => {
    if (isJp) {
      updateMember(idx, jpField, val);
      return;
    }
    updateMember(idx, field, val, jpField);
  };

  const toDateInputValue = (ddmmyyyy: string) => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('-');
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  const fromDateInputValue = (yyyymmdd: string) => {
    if (!yyyymmdd) return '';
    const parts = yyyymmdd.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return yyyymmdd;
  };

  return (
    <div className={`
      ${activeMobileTab === 'edit' ? 'flex' : 'hidden lg:flex'} 
      ${isEditorCollapsed ? 'lg:hidden' : 'lg:flex'}
      w-full lg:w-[400px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex-col print:hidden lg:h-full lg:max-h-none min-h-0
    `}>
      <div className="flex border-b border-slate-100 bg-slate-50/30">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 text-xs md:text-sm font-semibold text-center transition-all ${activeTab === 'upload' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)]' : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800'}`}
        >
          1. Upload
        </button>
        <button
          onClick={() => { setActiveTab('edit_id'); setViewLanguage?.('id'); }}
          className={`flex-1 py-3 text-xs md:text-sm font-semibold text-center transition-all ${activeTab === 'edit_id' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)]' : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800'}`}
        >
          2. Revisi Indo
        </button>
        <button
          onClick={() => { setActiveTab('edit_jp'); setViewLanguage?.('jp'); }}
          className={`flex-1 py-3 text-xs md:text-sm font-semibold text-center transition-all ${activeTab === 'edit_jp' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)]' : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800'}`}
        >
          3. Revisi Jepang
        </button>
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-xs md:text-sm text-indigo-950 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 leading-relaxed shadow-sm/5">
              <p className="flex items-start gap-2.5">
                <Sparkles className="text-indigo-600 flex-shrink-0 mt-0.5" size={16} />
                <span>Sistem akan menganalisis dokumen Kartu Keluarga Anda secara cerdas menggunakan Google Vision AI untuk mengekstrak teks.</span>
              </p>
            </div>

            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/10 transition-all duration-300 group cursor-pointer shadow-sm/5">
              {isExistingData ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-450 mb-3">
                    <Upload size={20} />
                  </div>
                  <p className="font-bold text-xs md:text-sm text-slate-700 mb-1">Data KK Sudah Ada</p>
                  <p className="text-[10px] text-slate-400 max-w-[220px]">Anda sudah memiliki data KK yang tersimpan. Untuk mengubah file scan, harap hubungi Admin.</p>
                </div>
              ) : ocrLoading ? (
                <div className="flex flex-col items-center text-indigo-700 text-center">
                  <Loader2 className="animate-spin mb-4 text-indigo-650" size={32} />
                  <p className="font-bold text-xs md:text-sm">Sedang Memproses Dokumen...</p>
                  <p className="text-[10px] text-slate-400 mt-2 max-w-[220px] leading-relaxed">Kecerdasan Buatan sedang membaca, menyeimbangkan, dan mengelompokkan baris tabel Anda.</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-450 mb-3 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-all duration-300">
                    <Upload size={20} />
                  </div>
                  <p className="font-bold text-xs md:text-sm text-slate-700 mb-1">Klik atau seret file Kartu Keluarga</p>
                  <p className="text-[10px] text-slate-400">Mendukung format JPG, JPEG, PNG (Maks. 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'edit_id' || activeTab === 'edit_jp') && (
          <div className="space-y-6">
            {/* ── Informasi Dasar ── */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-650 shadow-[0_0_8px_rgba(79,70,229,0.3)]"></span>
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Nomor KK</label>
                  <input
                    type="text"
                    value={formData.header.number}
                    onChange={e => updateHeader(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="Masukkan 16 digit Nomor KK"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Nama Kepala Keluarga (家長名)</label>
                  <PreservedTextInput
                    value={getBasicVal('kepalaKeluarga', 'kepalaKeluargaJp', keepRomanji)}
                    onChange={val => handleBasicChange('kepalaKeluarga', 'kepalaKeluargaJp', val)}
                    uppercase
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="Nama Kepala Keluarga"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Alamat (住所)</label>
                  <PreservedTextInput
                    value={getBasicVal('alamat', 'alamatJp', keepRomanji)}
                    onChange={val => handleBasicChange('alamat', 'alamatJp', val)}
                    uppercase
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="Jalan, Gang, Blok"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">RT/RW (隣組/民組)</label>
                  <input
                    type="text"
                    value={getBasicVal('rtRw', 'rtRwJp')}
                    onChange={e => handleBasicChange('rtRw', 'rtRwJp', e.target.value)}
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="000/000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Desa/Kel (村)</label>
                  <input
                    type="text"
                    value={getBasicVal('kelurahan', 'kelurahanJp', keepRomanji)}
                    onChange={e => handleBasicChange('kelurahan', 'kelurahanJp', e.target.value)}
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="Desa / Kelurahan"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Kecamatan (郡)</label>
                  <input
                    type="text"
                    value={getBasicVal('kecamatan', 'kecamatanJp', keepRomanji)}
                    onChange={e => handleBasicChange('kecamatan', 'kecamatanJp', e.target.value)}
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="Kecamatan"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Kab/Kota (市)</label>
                  <input
                    type="text"
                    value={getBasicVal('kabKota', 'kabKotaJp', keepRomanji)}
                    onChange={e => handleBasicChange('kabKota', 'kabKotaJp', e.target.value)}
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="Kabupaten / Kota"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Kode Pos (郵便番号)</label>
                  <input
                    type="text"
                    value={formData.basic.kodePos}
                    onChange={e => updateBasic('kodePos', e.target.value.toUpperCase())}
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="5 Digit Kode Pos"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Provinsi (州)</label>
                  <input
                    type="text"
                    value={getBasicVal('provinsi', 'provinsiJp', keepRomanji)}
                    onChange={e => handleBasicChange('provinsi', 'provinsiJp', e.target.value)}
                    className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all placeholder:text-slate-350"
                    placeholder="Provinsi"
                  />
                </div>
              </div>
            </div>

            {/* ── Daftar Anggota Keluarga ── */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-650 shadow-[0_0_8px_rgba(79,70,229,0.3)]"></span>
                Daftar Anggota Keluarga
              </h3>

              {formData.members.map((member, idx) => (
                <details
                  key={idx}
                  className="border border-slate-200/80 rounded-xl bg-slate-50/30 hover:bg-slate-50/60 group overflow-hidden transition-all duration-300"
                >
                  <summary className="px-4 py-3 text-xs md:text-sm font-semibold cursor-pointer hover:bg-white flex justify-between items-center list-none select-none transition-colors">
                    <span className="text-slate-700 font-bold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-750 flex items-center justify-center font-mono text-[10px] border border-indigo-100">{idx + 1}</span>
                      <span className="truncate max-w-[200px]">
                        {member.name ? member.name : <span className="text-slate-400 italic font-medium">(Baris Kosong)</span>}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                  </summary>

                  <div className="p-4 grid grid-cols-2 gap-3 bg-white text-[11px] border-t border-slate-150/60 transition-all duration-300">
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Nama Lengkap (姓名)</label>
                      <PreservedTextInput
                        value={getMemberVal(member, 'name', 'nameJp', keepRomanji)}
                        onChange={val => handleMemberChange(idx, 'name', 'nameJp', val)}
                        uppercase
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">NIK (人口登録番号)</label>
                      <input
                        type="text"
                        value={member.nik}
                        onChange={e => updateMember(idx, 'nik', e.target.value.toUpperCase())}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Jenis Kelamin</label>
                      <select
                        value={translateToId('gender', isJp ? (member.genderJp || member.gender) : member.gender)}
                        onChange={e => handleMemberChange(idx, 'gender', 'genderJp', e.target.value)}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2 py-1.2 font-medium text-slate-800 transition-all cursor-pointer"
                      >
                        <option value="">-</option>
                        <option value="L">{isJp ? '男 (L - JP)' : 'Laki-Laki (L)'}</option>
                        <option value="P">{isJp ? '女 (P - JP)' : 'Perempuan (P)'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Tempat Lahir</label>
                      <PreservedTextInput
                        value={getMemberVal(member, 'pob', 'pobJp', keepRomanji)}
                        onChange={val => handleMemberChange(idx, 'pob', 'pobJp', val)}
                        uppercase
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Tgl Lahir (生年月日)</label>
                      <input
                        type="date"
                        value={toDateInputValue(member.dob)}
                        onChange={e => updateMember(idx, 'dob', fromDateInputValue(e.target.value))}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Agama</label>
                      <input
                        type="text"
                        value={getMemberVal(member, 'religion', 'religionJp', translateToJp, 'religion')}
                        onChange={e => handleMemberChange(idx, 'religion', 'religionJp', e.target.value)}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                        placeholder="Contoh: ISLAM / キリスト教"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Golongan Darah</label>
                      <select
                        value={getMemberVal(member, 'bloodType', 'bloodTypeJp', translateToJp, 'bloodType')}
                        onChange={e => handleMemberChange(idx, 'bloodType', 'bloodTypeJp', e.target.value)}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all cursor-pointer"
                      >
                        <option value="">-</option>
                        {BLOOD_TYPE_OPTIONS.map(o => (
                          <option key={o.id} value={isJp ? o.jp : o.id}>{isJp ? o.jp : o.id}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Pendidikan</label>
                      {(() => {
                        const eduVal = getMemberVal(member, 'education', 'educationJp', translateToJp, 'education');
                        const showEduInput =
                          eduVal !== '' &&
                          !EDUCATION_OPTIONS.some(
                            (o) =>
                              isJp
                                ? o.jp === eduVal
                                : o.id === eduVal ||
                                  o.label.toUpperCase() === eduVal ||
                                  normalizeEducationId(eduVal) === o.id,
                          );
                        return (
                          <>
                            <select
                              value={showEduInput ? 'LAINNYA' : eduVal}
                              onChange={e => handleMemberChange(idx, 'education', 'educationJp', e.target.value)}
                              className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all cursor-pointer"
                            >
                              <option value="">-</option>
                              {EDUCATION_OPTIONS.map(o => (
                                <option key={o.id} value={isJp ? o.jp : o.id}>{isJp ? o.jp : o.label}</option>
                              ))}
                              <option value="LAINNYA">LAINNYA (KETIK MANUAL)</option>
                            </select>
                            {(showEduInput || eduVal === 'LAINNYA') && (
                              <input
                                type="text"
                                value={eduVal === 'LAINNYA' ? '' : eduVal}
                                onChange={e => handleMemberChange(idx, 'education', 'educationJp', e.target.value || 'LAINNYA')}
                                className="w-full uppercase mt-1.5 bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                                placeholder={isJp ? "マニュアル入力..." : "Ketik pendidikan..."}
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Pekerjaan</label>
                      {(() => {
                        const occVal = getMemberVal(member, 'occupation', 'occupationJp', translateToJp, 'occupation');
                        const showOccInput =
                          occVal !== '' &&
                          !OCCUPATION_OPTIONS.some(
                            (o) =>
                              isJp
                                ? o.jp === occVal
                                : o.id === occVal ||
                                  o.label.toUpperCase() === occVal ||
                                  normalizeOccupationId(occVal) === o.id,
                          );
                        return (
                          <>
                            <select
                              value={showOccInput ? 'LAINNYA' : occVal}
                              onChange={e => handleMemberChange(idx, 'occupation', 'occupationJp', e.target.value)}
                              className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all cursor-pointer"
                            >
                              <option value="">-</option>
                              {OCCUPATION_OPTIONS.map(o => (
                                <option key={o.id} value={isJp ? o.jp : o.id}>{isJp ? o.jp : o.label}</option>
                              ))}
                              <option value="LAINNYA">LAINNYA (KETIK MANUAL)</option>
                            </select>
                            {(showOccInput || occVal === 'LAINNYA') && (
                              <input
                                type="text"
                                value={occVal === 'LAINNYA' ? '' : occVal}
                                onChange={e => handleMemberChange(idx, 'occupation', 'occupationJp', e.target.value || 'LAINNYA')}
                                className="w-full uppercase mt-1.5 bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                                placeholder={isJp ? "マニュアル入力..." : "Ketik pekerjaan..."}
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Status Perkawinan</label>
                      <input
                        type="text"
                        value={getMemberVal(member, 'maritalStatus', 'maritalStatusJp', translateToJp, 'maritalStatus')}
                        onChange={e => handleMemberChange(idx, 'maritalStatus', 'maritalStatusJp', e.target.value)}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                        placeholder="BELUM KAWIN / KAWIN"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Tanggal Perkawinan (結婚日)</label>
                      <input
                        type="date"
                        value={toDateInputValue(member.marriageDate)}
                        onChange={e => updateMember(idx, 'marriageDate', fromDateInputValue(e.target.value))}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Hub. Keluarga</label>
                      <RelationshipField
                        value={member.relationship}
                        valueJp={member.relationshipJp}
                        isJp={isJp}
                        inputClassName="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                        onChange={(rel, relJp) => {
                          if (isJp) {
                            updateMember(idx, 'relationshipJp', relJp);
                            if (rel && rel !== 'LAINNYA') updateMember(idx, 'relationship', rel);
                            else if (rel === 'LAINNYA' && relJp) updateMember(idx, 'relationship', relJp.toUpperCase());
                          } else {
                            updateMember(idx, 'relationship', rel, 'relationshipJp');
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Kewarganegaraan</label>
                      <input
                        type="text"
                        value={getMemberVal(member, 'nationality', 'nationalityJp', translateToJp, 'nationality')}
                        onChange={e => handleMemberChange(idx, 'nationality', 'nationalityJp', e.target.value)}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                        placeholder="WNI"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Paspor</label>
                      <input
                        type="text"
                        value={member.passport}
                        onChange={e => updateMember(idx, 'passport', e.target.value.toUpperCase())}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">KITAS/KITAP</label>
                      <input
                        type="text"
                        value={member.kitas}
                        onChange={e => updateMember(idx, 'kitas', e.target.value.toUpperCase())}
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Nama Ayah (父)</label>
                      <PreservedTextInput
                        value={getMemberVal(member, 'father', 'fatherJp', keepRomanji)}
                        onChange={val => handleMemberChange(idx, 'father', 'fatherJp', val)}
                        uppercase
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Nama Ibu (母)</label>
                      <PreservedTextInput
                        value={getMemberVal(member, 'mother', 'motherJp', keepRomanji)}
                        onChange={val => handleMemberChange(idx, 'mother', 'motherJp', val)}
                        uppercase
                        className="w-full uppercase bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2.5 py-1.2 font-medium text-slate-800 transition-all"
                      />
                    </div>
                  </div>
                </details>
              ))}
            </div>

            {/* ── Footer & Penerbitan ── */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-650 shadow-[0_0_8px_rgba(79,70,229,0.3)]"></span>
                Footer & TTD
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Tanggal</label>
                  <input
                    type="text"
                    value={formData.footer.issueDate}
                    onChange={e => updateFooter('issueDate', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2 py-1.5 font-medium text-slate-800 transition-all"
                    placeholder="Tgl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Bulan</label>
                  <input
                    type="text"
                    value={formData.footer.issueMonth}
                    onChange={e => updateFooter('issueMonth', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2 py-1.5 font-medium text-slate-800 transition-all"
                    placeholder="Bln"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Tahun</label>
                  <input
                    type="text"
                    value={formData.footer.issueYear}
                    onChange={e => updateFooter('issueYear', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-2 py-1.5 font-medium text-slate-800 transition-all"
                    placeholder="Thn"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Nama Kepala Dinas (Kadis)</label>
                  <input
                    type="text"
                    value={formData.footer.kepalaDinas}
                    onChange={e => updateFooter('kepalaDinas', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all"
                    placeholder="NAMA LENGKAP KADIS"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 tracking-wider">Nomor Pegawai Kadis (NIP)</label>
                  <input
                    type="text"
                    value={formData.footer.nip}
                    onChange={e => updateFooter('nip', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 rounded-lg px-3 py-1.5 font-medium text-slate-800 transition-all"
                    placeholder="18 Digit NIP"
                  />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
