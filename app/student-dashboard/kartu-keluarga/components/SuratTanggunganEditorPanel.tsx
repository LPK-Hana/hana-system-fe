'use client';

import React from 'react';
import { Minus, Plus, UserCircle2 } from 'lucide-react';
import { KkFormData } from '../types';
import { SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import { kkMembersWithData } from '../utils/suratTanggunganMapper';
import { RelationshipField } from './RelationshipField';
import { PreservedTextInput } from './PreservedTextInput';

export type StEditorTab = 'select' | 'edit_id' | 'edit_jp';

interface SuratTanggunganEditorPanelProps {
  activeMobileTab: 'edit' | 'preview';
  isEditorCollapsed: boolean;
  activeTab: StEditorTab;
  setActiveTab: (tab: StEditorTab) => void;
  setViewLanguage?: (lang: 'id' | 'jp') => void;
  kkFormData: KkFormData;
  stFormData: SuratTanggunganFormData;
  onSelectApplicant: (memberIndex: number) => void;
  updateApplicant: (field: string, value: string) => void;
  updateDependent: (idx: number, field: string, value: string) => void;
  updateDependentRelationship: (idx: number, relationship: string, relationshipJp: string) => void;
  updateMeta: (field: keyof SuratTanggunganFormData, value: string) => void;
  onAddDependent: () => void;
  onRemoveDependent: (idx: number) => void;
}

const inputCls =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none';

export const SuratTanggunganEditorPanel: React.FC<SuratTanggunganEditorPanelProps> = ({
  activeMobileTab,
  isEditorCollapsed,
  activeTab,
  setActiveTab,
  setViewLanguage,
  kkFormData,
  stFormData,
  onSelectApplicant,
  updateApplicant,
  updateDependent,
  updateDependentRelationship,
  updateMeta,
  onAddDependent,
  onRemoveDependent,
}) => {
  const isJp = activeTab === 'edit_jp';
  const hasApplicant = stFormData.applicantMemberIndex !== null;
  const members = kkMembersWithData(kkFormData);
  const kkEmpty = members.length === 0;

  const getApplicantVal = (field: string, jpField?: string) => {
    const a = stFormData.applicant as Record<string, string>;
    if (!isJp) return a[field] ?? '';
    if (jpField && a[jpField]) return a[jpField];
    return a[field] ?? '';
  };

  const handleApplicant = (field: string, val: string) => {
    updateApplicant(field, val);
  };

  const handleDep = (idx: number, field: string, val: string) => {
    updateDependent(idx, field, val);
  };

  return (
    <div
      className={`
        ${activeMobileTab === 'edit' ? 'flex' : 'hidden lg:flex'}
        ${isEditorCollapsed ? 'lg:hidden' : 'lg:flex'}
        w-full lg:w-[400px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex-col print:hidden lg:h-full min-h-0
      `}
    >
      <div className="flex border-b border-slate-100 bg-slate-50/30">
        <button
          type="button"
          onClick={() => setActiveTab('select')}
          className={`flex-1 py-3 text-xs font-semibold text-center transition-all ${activeTab === 'select' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          1. Pilih Peserta
        </button>
        <button
          type="button"
          disabled={!hasApplicant}
          onClick={() => {
            setActiveTab('edit_id');
            setViewLanguage?.('id');
          }}
          className={`flex-1 py-3 text-xs font-semibold text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === 'edit_id' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          2. Revisi Indo
        </button>
        <button
          type="button"
          disabled={!hasApplicant}
          onClick={() => {
            setActiveTab('edit_jp');
            setViewLanguage?.('jp');
          }}
          className={`flex-1 py-3 text-xs font-semibold text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === 'edit_jp' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          3. Revisi Jepang
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'select' ? (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <p className="text-xs text-indigo-900 font-semibold leading-relaxed">
                Pilih anggota keluarga yang akan berangkat ke Jepang. Data Surat Tanggungan akan diisi otomatis dari KK.
              </p>
            </div>
            {kkEmpty ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Upload dan isi data KK terlebih dahulu di tab Kartu Keluarga.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map(({ m, index }) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSelectApplicant(index)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      stFormData.applicantMemberIndex === index
                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-200'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserCircle2
                      size={20}
                      className={stFormData.applicantMemberIndex === index ? 'text-indigo-600' : 'text-slate-400'}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{m.name || '(Tanpa nama)'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {m.relationship || '-'} · NIK {m.nik || '-'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {!isJp ? (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Surat</h3>
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Tanggal (DD-MM-YYYY)</span>
                  <input
                    className={inputCls}
                    placeholder="06-01-2021"
                    value={stFormData.signDateId}
                    onChange={(e) => updateMeta('signDateId', e.target.value)}
                  />
                </label>
              </section>
            ) : null}

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Data Pemohon {isJp ? '(Jepang)' : '(Indonesia)'}
              </h3>
              <label className="block space-y-1">
                <span className="text-[10px] font-semibold text-slate-500">Nama</span>
                <PreservedTextInput
                  className={inputCls}
                  value={getApplicantVal('name', 'nameJp')}
                  onChange={(val) => handleApplicant(isJp ? 'nameJp' : 'name', val)}
                  uppercase={!isJp}
                />
              </label>
              {isJp ? (
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Nama (Katakana)</span>
                  <input
                    className={inputCls}
                    value={stFormData.applicant.nameKatakana}
                    onChange={(e) => updateApplicant('nameKatakana', e.target.value)}
                  />
                </label>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Jenis Kelamin</span>
                  <input
                    className={inputCls}
                    value={getApplicantVal('gender', 'genderJp')}
                    onChange={(e) => handleApplicant(isJp ? 'genderJp' : 'gender', e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Tgl Lahir (DD-MM-YYYY)</span>
                  <input
                    className={inputCls}
                    value={stFormData.applicant.dob}
                    onChange={(e) => updateApplicant('dob', e.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[10px] font-semibold text-slate-500">NIK</span>
                <input
                  className={inputCls}
                  value={stFormData.applicant.nik}
                  onChange={(e) => updateApplicant('nik', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Tgl Terbit KTP</span>
                  <input
                    className={inputCls}
                    value={isJp ? stFormData.applicant.ktpIssueDateJp : stFormData.applicant.ktpIssueDate}
                    onChange={(e) =>
                      isJp
                        ? updateApplicant('ktpIssueDateJp', e.target.value)
                        : updateApplicant('ktpIssueDate', e.target.value)
                    }
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Kewarganegaraan</span>
                  <input
                    className={inputCls}
                    value={getApplicantVal('nationality', 'nationalityJp')}
                    onChange={(e) => handleApplicant(isJp ? 'nationalityJp' : 'nationality', e.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[10px] font-semibold text-slate-500">Domisili</span>
                <PreservedTextInput
                  className={inputCls}
                  value={getApplicantVal('domisili', 'domisiliJp')}
                  onChange={(val) => handleApplicant(isJp ? 'domisiliJp' : 'domisili', val)}
                  uppercase={!isJp}
                />
              </label>
              {isJp ? (
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Domisili (Katakana)</span>
                  <input
                    className={inputCls}
                    value={stFormData.applicant.domisiliKatakana}
                    onChange={(e) => updateApplicant('domisiliKatakana', e.target.value)}
                  />
                </label>
              ) : null}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Tanggungan</h3>
                <button
                  type="button"
                  onClick={onAddDependent}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={12} />
                  Tambah
                </button>
              </div>
              {stFormData.dependents.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-4 border border-dashed border-slate-200 rounded-xl">
                  Belum ada tanggungan. Klik Tambah untuk menambah baris.
                </p>
              ) : null}
              {stFormData.dependents.map((dep, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-indigo-700">Baris {idx + 1}</p>
                    <button
                      type="button"
                      onClick={() => onRemoveDependent(idx)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Minus size={12} />
                      Hapus
                    </button>
                  </div>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500">Hubungan</span>
                    <RelationshipField
                      value={dep.relationship}
                      valueJp={dep.relationshipJp}
                      isJp={isJp}
                      inputClassName={inputCls}
                      onChange={(rel, relJp) => updateDependentRelationship(idx, rel, relJp)}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500">Nama</span>
                    <PreservedTextInput
                      className={inputCls}
                      value={isJp ? dep.nameJp : dep.name}
                      onChange={(val) => handleDep(idx, isJp ? 'nameJp' : 'name', val)}
                      uppercase={!isJp}
                    />
                  </label>
                  {isJp ? (
                    <label className="block space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500">Nama (Katakana)</span>
                      <input
                        className={inputCls}
                        value={dep.nameKatakana}
                        onChange={(e) => updateDependent(idx, 'nameKatakana', e.target.value)}
                      />
                    </label>
                  ) : null}
                  <label className="block space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500">Tanggal Lahir</span>
                    <input
                      className={inputCls}
                      value={dep.dob}
                      onChange={(e) => updateDependent(idx, 'dob', e.target.value)}
                    />
                  </label>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanda Tangan</h3>
              <div className="grid grid-cols-3 gap-2">
                <label className="block space-y-1 col-span-3">
                  <span className="text-[10px] font-semibold text-slate-500">Kota / Kabupaten</span>
                  <input
                    className={inputCls}
                    value={isJp ? stFormData.locationJp : stFormData.locationId}
                    onChange={(e) =>
                      isJp ? updateMeta('locationJp', e.target.value) : updateMeta('locationId', e.target.value)
                    }
                  />
                </label>
                {isJp ? (
                  <label className="block space-y-1 col-span-3">
                    <span className="text-[10px] font-semibold text-slate-500">Nama Desa (村御中)</span>
                    <input
                      className={inputCls}
                      value={stFormData.villageNameJp}
                      onChange={(e) => updateMeta('villageNameJp', e.target.value)}
                    />
                  </label>
                ) : null}
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Tahun</span>
                  <input
                    className={inputCls}
                    value={stFormData.signDateYear}
                    onChange={(e) => updateMeta('signDateYear', e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Bulan</span>
                  <input
                    className={inputCls}
                    value={stFormData.signDateMonth}
                    onChange={(e) => updateMeta('signDateMonth', e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Hari</span>
                  <input
                    className={inputCls}
                    value={stFormData.signDateDay}
                    onChange={(e) => updateMeta('signDateDay', e.target.value)}
                  />
                </label>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
