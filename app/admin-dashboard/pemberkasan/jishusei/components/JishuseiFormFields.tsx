"use client";

import React from 'react';
import { Form, Input, DatePicker, Button, RadioGroup, Radio } from 'rsuite';
import type { JishuseiPage1Data } from '../types';
import { emptyEducation, emptyWorkHistory } from '../types';

const FormField = ({
  name,
  label,
  text,
  className,
  ...props
}: {
  name: string;
  label: string;
  text?: string;
  className?: string;
  [key: string]: unknown;
}) => (
  <Form.Group controlId={name} className={className}>
    <Form.ControlLabel>{label}</Form.ControlLabel>
    <Form.Control name={name} style={{ width: '100%' }} {...props} />
    {text && <Form.HelpText>{text}</Form.HelpText>}
  </Form.Group>
);

const CustomTextarea = React.forwardRef<HTMLTextAreaElement, Record<string, unknown>>((props, ref) => (
  <Input {...props} as="textarea" ref={ref} />
));
CustomTextarea.displayName = 'CustomTextarea';

interface Props {
  formData: Omit<JishuseiPage1Data, 'id'>;
  onChange: (value: Omit<JishuseiPage1Data, 'id'>) => void;
}

export default function JishuseiFormFields({ formData, onChange }: Props) {
  const updateEducation = (index: number, field: string, value: unknown) => {
    const educations = [...formData.educations];
    educations[index] = { ...educations[index], [field]: value };
    onChange({ ...formData, educations });
  };

  const updateWork = (index: number, field: string, value: unknown) => {
    const workHistories = [...formData.workHistories];
    workHistories[index] = { ...workHistories[index], [field]: value };
    onChange({ ...formData, workHistories });
  };

  const toDate = (v: string | null) => (v ? new Date(v) : null);
  const fromDate = (v: Date | null) => (v ? v.toISOString() : null);

  return (
    <Form
      fluid
      formValue={formData as Record<string, unknown>}
      onChange={(v) => onChange({ ...formData, ...(v as Omit<JishuseiPage1Data, 'id'>) })}
    >
      <h5 className="text-sm font-bold text-emerald-800 mb-4 border-b pb-2">Tanggal Pembuatan</h5>
      <FormField
        name="dateCreated"
        label="Tanggal Pembuatan Dokumen"
        accepter={DatePicker}
        format="dd MMM yyyy"
        value={toDate(formData.dateCreated)}
        onChange={(v: Date | null) => onChange({ ...formData, dateCreated: fromDate(v) })}
      />

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">① Nama Lengkap</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField name="romajiName" label="Nama (Romawi / Huruf Paspor)" placeholder="Contoh: ABDUL MUHSI FAUZI" />
        <FormField name="kanjiName" label="Nama (Kanji)" placeholder="Contoh: アブドゥル・ムフシ・ファウジ" />
      </div>

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">② Jenis Kelamin</h5>
      <Form.Group>
        <RadioGroup
          inline
          value={formData.gender}
          onChange={(v) => onChange({ ...formData, gender: v as 'male' | 'female' })}
        >
          <Radio value="male">Laki-laki (男)</Radio>
          <Radio value="female">Perempuan (女)</Radio>
        </RadioGroup>
      </Form.Group>

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">③ Tanggal Lahir & Umur</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="birthDate"
          label="Tanggal Lahir"
          accepter={DatePicker}
          format="dd MMM yyyy"
          value={toDate(formData.birthDate)}
          onChange={(v: Date | null) => onChange({ ...formData, birthDate: fromDate(v) })}
        />
        <FormField name="age" label="Umur (歳)" type="number" placeholder="Contoh: 22" />
      </div>

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">④ Kewarganegaraan</h5>
      <FormField name="nationality" label="Negara / Wilayah" placeholder="INDONESIA" />

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">⑤ Bahasa Ibu</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField name="motherTongueJa" label="Bahasa Ibu (Jepang)" placeholder="インドネシア語" />
        <FormField name="motherTongueId" label="Bahasa Ibu (Indonesia)" placeholder="Bahasa Indonesia" />
      </div>

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">⑥ Alamat Sekarang</h5>
      <FormField name="address" label="Alamat Lengkap" accepter={CustomTextarea} rows={3} />

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">⑦ Riwayat Pendidikan</h5>
      {formData.educations.map((edu, i) => (
        <div key={i} className="mb-4 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
          <p className="text-xs font-bold text-emerald-700 mb-3">Pendidikan #{i + 1}</p>
          <FormField name={`school-${i}`} label="Nama Sekolah" value={edu.schoolName} onChange={(v: string) => updateEducation(i, 'schoolName', v)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              name={`edu-start-${i}`}
              label="Mulai (Bulan/Tahun)"
              accepter={DatePicker}
              format="MM yyyy"
              value={toDate(edu.startDate)}
              onChange={(v: Date | null) => updateEducation(i, 'startDate', fromDate(v))}
            />
            <FormField
              name={`edu-end-${i}`}
              label="Lulus (Bulan/Tahun)"
              accepter={DatePicker}
              format="MM yyyy"
              value={toDate(edu.endDate)}
              onChange={(v: Date | null) => updateEducation(i, 'endDate', fromDate(v))}
            />
          </div>
        </div>
      ))}
      <Button
        appearance="ghost"
        size="sm"
        className="!mb-4"
        onClick={() => onChange({ ...formData, educations: [...formData.educations, emptyEducation()] })}
      >
        + Tambah Pendidikan
      </Button>

      <h5 className="text-sm font-bold text-emerald-800 mt-2 mb-4 border-b pb-2">⑧ Riwayat Pekerjaan</h5>
      {formData.workHistories.map((work, i) => (
        <div key={i} className="mb-4 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
          <p className="text-xs font-bold text-emerald-700 mb-3">Pekerjaan #{i + 1}</p>
          <FormField name={`company-${i}`} label="Nama Perusahaan" value={work.company} onChange={(v: string) => updateWork(i, 'company', v)} />
          <FormField name={`jobType-${i}`} label="Jenis Pekerjaan (職種)" value={work.jobType} onChange={(v: string) => updateWork(i, 'jobType', v)} placeholder="Contoh: 物流 / Logistik" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              name={`work-start-${i}`}
              label="Mulai (Bulan/Tahun)"
              accepter={DatePicker}
              format="MM yyyy"
              value={toDate(work.startDate)}
              onChange={(v: Date | null) => updateWork(i, 'startDate', fromDate(v))}
            />
            <FormField
              name={`work-end-${i}`}
              label="Selesai (Bulan/Tahun)"
              accepter={DatePicker}
              format="MM yyyy"
              value={toDate(work.endDate)}
              onChange={(v: Date | null) => updateWork(i, 'endDate', fromDate(v))}
              disabled={work.isCurrent}
            />
          </div>
          <Form.Group className="mt-2">
            <Form.ControlLabel>Masih bekerja (現在まで)</Form.ControlLabel>
            <RadioGroup
              inline
              value={work.isCurrent ? 'yes' : 'no'}
              onChange={(v) => {
                const isCurrent = v === 'yes';
                updateWork(i, 'isCurrent', isCurrent);
                if (isCurrent) updateWork(i, 'endDate', null);
              }}
            >
              <Radio value="yes">Ya</Radio>
              <Radio value="no">Tidak</Radio>
            </RadioGroup>
          </Form.Group>
        </div>
      ))}
      <Button
        appearance="ghost"
        size="sm"
        className="!mb-4"
        onClick={() => onChange({ ...formData, workHistories: [...formData.workHistories, emptyWorkHistory()] })}
      >
        + Tambah Pekerjaan
      </Button>

      <h5 className="text-sm font-bold text-emerald-800 mt-2 mb-4 border-b pb-2">
        ⑨ Pengalaman Kerja terkait Keterampilan Magang
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField name="relatedSkillJobJa" label="Jenis Pekerjaan (Jepang)" placeholder="牛豚食肉処理加工業" />
        <FormField name="relatedSkillJobId" label="Jenis Pekerjaan (Indonesia)" placeholder="Pengolahan Daging sapi dan babi" />
      </div>
      <FormField name="relatedSkillDurationMonths" label="Lama (Bulan / ヶ月)" type="number" placeholder="10" />

      <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">⑩ Pengalaman Kedatangan di Jepang</h5>
      <Form.Group>
        <Form.ControlLabel>Pernah datang ke Jepang?</Form.ControlLabel>
        <RadioGroup
          inline
          value={formData.japanVisitExperience}
          onChange={(v) => onChange({ ...formData, japanVisitExperience: v as 'yes' | 'no' })}
        >
          <Radio value="yes">Ada (有)</Radio>
          <Radio value="no">Tidak ada (無)</Radio>
        </RadioGroup>
        <Form.HelpText>Di dokumen PDF akan ditampilkan format checkbox resmi sesuai pilihan Anda.</Form.HelpText>
      </Form.Group>
    </Form>
  );
}
