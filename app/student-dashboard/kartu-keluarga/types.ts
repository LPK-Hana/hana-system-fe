export interface KkMember {
  name: string;
  nik: string;
  gender: string;
  pob: string;
  dob: string;
  religion: string;
  education: string;
  occupation: string;
  maritalStatus: string;
  marriageDate: string;
  relationship: string;
  nationality: string;
  passport: string;
  kitas: string;
  father: string;
  mother: string;
  nameJp?: string;
  pobJp?: string;
  fatherJp?: string;
  motherJp?: string;
  genderJp?: string;
  religionJp?: string;
  educationJp?: string;
  occupationJp?: string;
  maritalStatusJp?: string;
  marriageDateJp?: string;
  relationshipJp?: string;
  nationalityJp?: string;
  bloodType?: string;
  bloodTypeJp?: string;
}

export interface KkHeader {
  number: string;
}

export interface KkBasicInfo {
  kepalaKeluarga: string;
  alamat: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kabKota: string;
  kodePos: string;
  provinsi: string;
  kepalaKeluargaJp?: string;
  alamatJp?: string;
  rtRwJp?: string;
  kelurahanJp?: string;
  kecamatanJp?: string;
  kabKotaJp?: string;
  provinsiJp?: string;
}

export interface KkFooterInfo {
  issueYear: string;
  issueMonth: string;
  issueDate: string;
  nip: string;
  kepalaDinas: string;
}

export interface KkFormData {
  header: KkHeader;
  basic: KkBasicInfo;
  members: KkMember[];
  footer: KkFooterInfo;
}

export const emptyMember: KkMember = {
  name: '',
  nik: '',
  gender: '',
  pob: '',
  dob: '',
  religion: '',
  education: '',
  occupation: '',
  maritalStatus: '',
  marriageDate: '',
  relationship: '',
  nationality: '',
  passport: '',
  kitas: '',
  father: '',
  mother: '',
  bloodType: '',
  bloodTypeJp: '',
};

export const initialFormData: KkFormData = {
  header: { number: '' },
  basic: {
    kepalaKeluarga: '',
    alamat: '',
    rtRw: '',
    kelurahan: '',
    kecamatan: '',
    kabKota: '',
    kodePos: '',
    provinsi: '',
  },
  members: Array.from({ length: 10 }, () => ({ ...emptyMember })),
  footer: {
    issueYear: '',
    issueMonth: '',
    issueDate: '',
    nip: '',
    kepalaDinas: '',
  },
};
