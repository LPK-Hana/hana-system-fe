import { KkFormData, KkMember } from '../types';
import {
  emptyStApplicant,
  emptyStDependent,
  StDependent,
  SuratTanggunganFormData,
} from '../types/suratTanggunganTypes';
import {
  keepRomanji,
  translateToId,
  translateToJp,
  translateToKatakana,
} from './translations';
import { formatJpCalendarDate } from './kkJpFormat';

function formatDobId(dob: string): string {
  if (!dob) return '';
  const raw = dob.includes('T') ? dob.split('T')[0] : dob;
  const parts = raw.split('-');
  if (parts.length !== 3) return dob;
  if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return raw;
}

function formatGenderId(gender: string): string {
  const g = gender.toUpperCase();
  if (g.startsWith('L') || g.includes('LAKI') || g === 'M') return 'Laki - laki';
  if (g.startsWith('P') || g.includes('PEREMPUAN') || g === 'F') return 'Perempuan';
  return gender;
}

function relationshipToStId(member: KkMember, applicant: KkMember): string {
  const name = member.name.trim().toUpperCase();
  if (applicant.father && name === applicant.father.trim().toUpperCase()) return 'Ayah';
  if (applicant.mother && name === applicant.mother.trim().toUpperCase()) return 'Ibu';

  const rel = member.relationship.toUpperCase();
  if (rel.includes('KEPALA')) return 'Ayah';
  if (rel.includes('ISTRI')) return 'Ibu';
  if (rel.includes('ANAK')) {
    const g = member.gender.toUpperCase();
    if (g.startsWith('P') || g.includes('PEREMPUAN')) return 'Adik Perempuan';
    return 'Adik Laki-laki';
  }
  if (rel.includes('SUAMI')) return 'Suami';
  if (rel.includes('SAUDARA')) {
    const g = member.gender.toUpperCase();
    if (g.startsWith('P') || g.includes('PEREMPUAN')) return 'Adik Perempuan';
    return 'Adik Laki-laki';
  }
  return translateToId('relationship', member.relationship) || member.relationship;
}

const ST_REL_JP: Record<string, string> = {
  Ayah: '父',
  Ibu: '母',
  'Adik Perempuan': '妹',
  'Adik Laki-laki': '弟',
  'Kakak Perempuan': '姉',
  'Kakak Laki-laki': '兄',
  Suami: '夫',
  Istri: '妻',
  Anak: '子',
};

function relationshipToStJp(idLabel: string): string {
  return ST_REL_JP[idLabel] || idLabel;
}

function buildDomisili(basic: KkFormData['basic']): string {
  return [basic.kelurahan, basic.kecamatan, basic.kabKota, basic.provinsi]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ')
    .toUpperCase();
}

function buildDomisiliJp(basic: KkFormData['basic']): string {
  const parts = [
    basic.kelurahanJp || basic.kelurahan,
    basic.kecamatanJp || basic.kecamatan,
    basic.kabKotaJp || basic.kabKota,
    basic.provinsiJp || basic.provinsi,
  ];
  return parts
    .map((s) => keepRomanji(s))
    .filter(Boolean)
    .join(', ');
}

function memberToDependent(member: KkMember, applicant: KkMember): StDependent {
  const relationship = relationshipToStId(member, applicant);
  const name = member.name.trim().toUpperCase();
  return {
    relationship,
    relationshipJp: relationshipToStJp(relationship),
    name,
    nameJp: member.nameJp || keepRomanji(name),
    nameKatakana: translateToKatakana(name),
    dob: formatDobId(member.dob),
  };
}

function findMemberByName(members: KkMember[], name: string): KkMember | undefined {
  if (!name.trim()) return undefined;
  const target = name.trim().toUpperCase();
  return members.find((m) => m.name.trim().toUpperCase() === target);
}

function collectDependents(kk: KkFormData, applicantIdx: number, applicant: KkMember): StDependent[] {
  const rows: StDependent[] = [];
  const used = new Set<string>();

  const push = (dep: StDependent) => {
    const key = dep.name.trim().toUpperCase();
    if (!key || used.has(key)) return;
    used.add(key);
    rows.push(dep);
  };

  if (applicant.father.trim()) {
    const fatherMember = findMemberByName(kk.members, applicant.father);
    push(
      fatherMember
        ? memberToDependent(fatherMember, applicant)
        : {
            ...emptyStDependent(),
            relationship: 'Ayah',
            relationshipJp: '父',
            name: applicant.father.trim().toUpperCase(),
            nameJp: keepRomanji(applicant.father),
            nameKatakana: translateToKatakana(applicant.father),
            dob: fatherMember ? formatDobId(fatherMember.dob) : '',
          },
    );
  }

  if (applicant.mother.trim()) {
    const motherMember = findMemberByName(kk.members, applicant.mother);
    push(
      motherMember
        ? memberToDependent(motherMember, applicant)
        : {
            ...emptyStDependent(),
            relationship: 'Ibu',
            relationshipJp: '母',
            name: applicant.mother.trim().toUpperCase(),
            nameJp: keepRomanji(applicant.mother),
            nameKatakana: translateToKatakana(applicant.mother),
            dob: motherMember ? formatDobId(motherMember.dob) : '',
          },
    );
  }

  kk.members.forEach((m, i) => {
    if (i === applicantIdx || !m.name.trim()) return;
    const rel = m.relationship.toUpperCase();
    if (rel.includes('ANAK') || rel.includes('SAUDARA') || rel.includes('MENANTU') || rel.includes('CUCU')) {
      push(memberToDependent(m, applicant));
    }
  });

  while (rows.length < 3) rows.push(emptyStDependent());
  return rows.slice(0, 3);
}

export function buildSuratTanggunganFromKk(
  kk: KkFormData,
  applicantMemberIndex: number,
): SuratTanggunganFormData {
  const applicantMember = kk.members[applicantMemberIndex];
  if (!applicantMember?.name.trim()) {
    throw new Error('Anggota KK tidak valid');
  }

  const domisili = buildDomisili(kk.basic);
  const domisiliJp = buildDomisiliJp(kk.basic);
  const name = applicantMember.name.trim().toUpperCase();

  const applicant = {
    name,
    nameJp: applicantMember.nameJp || keepRomanji(name),
    nameKatakana: translateToKatakana(name),
    gender: formatGenderId(applicantMember.gender),
    genderJp: translateToJp('gender', applicantMember.gender) || '男',
    dob: formatDobId(applicantMember.dob),
    nik: applicantMember.nik,
    ktpIssueDate: '',
    ktpIssueDateJp: '',
    domisili,
    domisiliJp,
    domisiliKatakana: translateToKatakana(domisili),
    nationality: 'Indonesia',
    nationalityJp: 'インドネシア',
  };

  const kab = kk.basic.kabKota.trim().toUpperCase();
  const kabJp = kk.basic.kabKotaJp || keepRomanji(kk.basic.kabKota);

  return {
    applicantMemberIndex,
    applicant,
    dependents: collectDependents(kk, applicantMemberIndex, applicantMember),
    locationId: kab,
    locationJp: translateToKatakana(kab) || kabJp,
    signDateYear: '',
    signDateMonth: '',
    signDateDay: '',
    villageNameJp: kk.basic.kelurahanJp
      ? translateToKatakana(kk.basic.kelurahan)
      : translateToKatakana(kk.basic.kelurahan),
  };
}

export function formatStDobJp(dobId: string): string {
  if (!dobId) return '';
  const parts = dobId.split('-');
  if (parts.length === 3 && parts[0].length === 2) {
    return formatJpCalendarDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return formatJpCalendarDate(dobId);
}

export function kkMembersWithData(kk: KkFormData) {
  return kk.members
    .map((m, index) => ({ m, index }))
    .filter(({ m }) => m.name.trim() || m.nik.trim());
}
