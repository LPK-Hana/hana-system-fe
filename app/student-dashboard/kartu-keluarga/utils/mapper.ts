import { KkFormData } from '../types';
import { keepRomanji, translateToId, translateToJp } from './translations';

function parseDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '-' || dateStr.trim() === '') return '';
  // Try to standardize to YYYY-MM-DD if it's DD-MM-YYYY
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      // DD-MM-YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
}

export function mapToKKID(data: KkFormData) {
  const validMembers = data.members.filter(m => m.name && m.name.trim() !== '' && m.name !== '-');

  return {
    nomor_kk: data.header.number || '',
    nama_kepala_keluarga: data.basic.kepalaKeluarga || '',
    alamat: data.basic.alamat || '',
    rt_rw: data.basic.rtRw || '',
    desa_kelurahan: data.basic.kelurahan || '',
    kecamatan: data.basic.kecamatan || '',
    kab_kota: data.basic.kabKota || '',
    kode_pos: data.basic.kodePos || '',
    provinsi: data.basic.provinsi || '',
    tgl_terbit: data.footer.issueDate || '',
    bln_terbit: data.footer.issueMonth || '',
    thn_terbit: data.footer.issueYear || '',
    nama_kepala_dinas: data.footer.kepalaDinas || '',
    nip_kadis: data.footer.nip || '',
    // ID version: stored as-is (Indonesia)
    details: validMembers.map((m) => ({
      nama_lengkap: m.name || '',
      nik: m.nik || '',
      jenis_kelamin: m.gender ? translateToId('gender', m.gender) : '',
      tempat_lahir: m.pob || '',
      tanggal_lahir: parseDate(m.dob),
      agama: m.religion ? translateToId('religion', m.religion) : '',
      pendidikan: m.education ? translateToId('education', m.education) : '',
      pekerjaan: m.occupation ? translateToId('occupation', m.occupation) : '',
      gol_darah: m.bloodType ? translateToId('bloodType', m.bloodType || '') : '',
      status_perkawinan: m.maritalStatus ? translateToId('maritalStatus', m.maritalStatus) : '',
      hub_keluarga: m.relationship ? translateToId('relationship', m.relationship) : '',
      kewarganegaraan: m.nationality ? translateToId('nationality', m.nationality) : '',
      no_paspor: m.passport || '',
      no_kitas_kitap: m.kitas || '',
      nama_ayah: m.father || '',
      nama_ibu: m.mother || '',
    })),
  };
}

export function mapToKKJP(data: KkFormData) {
  const validMembers = data.members.filter(m => m.name && m.name.trim() !== '' && m.name !== '-');

  const kepalaDinasJp = data.footer.kepalaDinas
    ? data.footer.kepalaDinas.toUpperCase()
    : '';

  return {
    nomor_kk: data.header.number || '',
    nama_kepala_keluarga: data.basic.kepalaKeluargaJp || keepRomanji(data.basic.kepalaKeluarga) || '',
    alamat: data.basic.alamatJp || keepRomanji(data.basic.alamat) || '',
    rt_rw: data.basic.rtRwJp || data.basic.rtRw || '',
    desa_kelurahan: data.basic.kelurahanJp || keepRomanji(data.basic.kelurahan) || '',
    kecamatan: data.basic.kecamatanJp || keepRomanji(data.basic.kecamatan) || '',
    kab_kota: data.basic.kabKotaJp || keepRomanji(data.basic.kabKota) || '',
    kode_pos: data.basic.kodePos || '',
    provinsi: data.basic.provinsiJp || keepRomanji(data.basic.provinsi) || '',
    tgl_terbit: data.footer.issueDate || '',
    bln_terbit: data.footer.issueMonth || '',
    thn_terbit: data.footer.issueYear || '',
    nama_kepala_dinas: kepalaDinasJp,
    nip_kadis: data.footer.nip || '',
    details: validMembers.map((m) => ({
      nama_lengkap: m.nameJp || keepRomanji(m.name) || '',
      nik: m.nik || '',
      jenis_kelamin: (m.genderJp || m.gender) ? translateToId('gender', m.genderJp || m.gender) : '',
      tempat_lahir: m.pobJp || keepRomanji(m.pob) || '',
      tanggal_lahir: parseDate(m.dob),
      agama: (m.religionJp || m.religion) ? translateToJp('religion', m.religionJp || m.religion) : '',
      pendidikan: (m.educationJp || m.education) ? translateToJp('education', m.educationJp || m.education) : '',
      pekerjaan: (m.occupationJp || m.occupation) ? translateToJp('occupation', m.occupationJp || m.occupation) : '',
      gol_darah: (m.bloodTypeJp || m.bloodType) ? translateToJp('bloodType', m.bloodTypeJp || m.bloodType || '') : '',
      status_perkawinan: (m.maritalStatusJp || m.maritalStatus) ? translateToJp('maritalStatus', m.maritalStatusJp || m.maritalStatus) : '',
      hub_keluarga: (m.relationshipJp || m.relationship)
        ? translateToJp('relationship', m.relationshipJp || m.relationship)
        : '',
      kewarganegaraan: (m.nationalityJp || m.nationality) ? translateToJp('nationality', m.nationalityJp || m.nationality) : '',
      no_paspor: m.passport || '',
      no_kitas_kitap: m.kitas || '',
      nama_ayah: m.fatherJp || keepRomanji(m.father) || '',
      nama_ibu: m.motherJp || keepRomanji(m.mother) || '',
    })),
  };
}
