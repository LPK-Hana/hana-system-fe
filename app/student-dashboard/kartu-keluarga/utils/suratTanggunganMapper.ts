import { KkFormData, KkMember } from '../types';
import {
  defaultSignDateId,
  parseSignDateId,
  StDependent,
  SuratTanggunganFormData,
} from '../types/suratTanggunganTypes';
import {
  buildDomisiliJpFromParts,
  buildDomisiliKatakanaFromParts,
  translateCityToJp,
  translateRegionToJp,
} from './regionTranslations';
import { relationshipJpFromId, relationshipDropdownValue } from './relationshipOptions';
import {
  keepRomanji,
  translateToJp,
  translateToKatakana,
} from './translations';
import { formatJpIssueDate } from './kkJpFormat';

function formatDobId(dob: string): string {
  if (!dob) return '';
  const raw = dob.includes('T') ? dob.split('T')[0] : dob;
  const parts = raw.split('-');
  if (parts.length !== 3) return dob;
  if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return raw;
}

/** Format JP: 1992年10月　11日 */
export function formatStDobJpDisplay(dob: string | undefined): string {
  if (!dob) return '';
  const raw = dob.includes('T') ? dob.split('T')[0] : dob;
  const parts = raw.split('-');
  if (parts.length !== 3) return raw;
  let y: string;
  let m: string;
  let d: string;
  if (parts[0].length === 4) {
    [y, m, d] = parts;
  } else {
    [d, m, y] = parts;
  }
  return `${+y}年${+m}月${+d}日`;
}

function formatGenderId(gender: string): string {
  const g = gender.toUpperCase();
  if (g.startsWith('L') || g.includes('LAKI') || g === 'M') return 'Laki-laki';
  if (g.startsWith('P') || g.includes('PEREMPUAN') || g === 'F') return 'Perempuan';
  return gender;
}

function titleCasePart(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildDomisili(basic: KkFormData['basic']): string {
  return [basic.kelurahan, basic.kecamatan, basic.kabKota, basic.provinsi]
    .map((s) => titleCasePart(s))
    .filter(Boolean)
    .join(', ');
}

function relationshipFromKkJp(member: KkMember): string {
  const rel = member.relationship.trim();
  if (!rel) return member.relationshipJp || '';
  if (member.relationshipJp?.trim()) return member.relationshipJp.trim();
  if (relationshipDropdownValue(rel) === 'LAINNYA') {
    return relationshipJpFromId('LAINNYA', rel);
  }
  return relationshipJpFromId(rel) || translateToJp('relationship', rel) || rel;
}

function memberToDependent(member: KkMember): StDependent {
  const name = member.name.trim().toUpperCase();
  const relationship = member.relationship.trim() || '';
  return {
    relationship,
    relationshipJp: relationshipFromKkJp(member),
    name,
    nameJp: member.nameJp || keepRomanji(name),
    nameKatakana: translateToKatakana(name),
    dob: formatDobId(member.dob),
  };
}

/** Hanya anggota KK (nama lengkap) selain pemohon — bukan nama orang tua di field terpisah */
function collectDependents(kk: KkFormData, applicantIdx: number): StDependent[] {
  return kk.members
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => i !== applicantIdx && m.name.trim())
    .map(({ m }) => memberToDependent(m));
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
  const domisiliJp = buildDomisiliJpFromParts(kk.basic);
  const domisiliKatakana = buildDomisiliKatakanaFromParts(kk.basic);
  const name = applicantMember.name.trim().toUpperCase();
  const issueDateId =
    kk.footer.issueDate && kk.footer.issueMonth && kk.footer.issueYear
      ? `${kk.footer.issueDate.padStart(2, '0')}-${kk.footer.issueMonth.padStart(2, '0')}-${kk.footer.issueYear}`
      : '';

  const signDateId = defaultSignDateId();
  const signParts = parseSignDateId(signDateId);

  const applicant = {
    name,
    nameJp: applicantMember.nameJp || keepRomanji(name),
    nameKatakana: translateToKatakana(name),
    gender: formatGenderId(applicantMember.gender),
    genderJp: translateToJp('gender', applicantMember.gender) || '男',
    dob: formatDobId(applicantMember.dob),
    nik: applicantMember.nik,
    ktpIssueDate: issueDateId,
    ktpIssueDateJp: formatJpIssueDate(kk.footer.issueYear, kk.footer.issueMonth, kk.footer.issueDate),
    domisili,
    domisiliJp,
    domisiliKatakana,
    nationality: 'Indonesia',
    nationalityJp: 'インドネシア',
  };

  const kab = titleCasePart(kk.basic.kabKota);

  return {
    applicantMemberIndex,
    applicant,
    dependents: collectDependents(kk, applicantMemberIndex),
    locationId: kab,
    locationJp: kk.basic.kabKotaJp?.trim() || translateCityToJp(kk.basic.kabKota),
    signDateId,
    signDateYear: signParts.year,
    signDateMonth: signParts.month,
    signDateDay: signParts.day,
    villageNameJp: kk.basic.kelurahanJp?.trim() || translateRegionToJp(kk.basic.kelurahan),
  };
}

export function formatStDobJp(dobId: string): string {
  return formatStDobJpDisplay(dobId);
}

export function kkMembersWithData(kk: KkFormData) {
  return kk.members
    .map((m, index) => ({ m, index }))
    .filter(({ m }) => m.name.trim() || m.nik.trim());
}
