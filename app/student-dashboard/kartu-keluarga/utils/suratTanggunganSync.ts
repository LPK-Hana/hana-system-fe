import type { KkFormData } from '../types';
import type { StApplicant, StDependent, SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import { buildDomisiliJpFromParts, buildDomisiliKatakanaFromParts, translateCityToJp, translateProvinceToJp, translateRegionToJp } from './regionTranslations';
import { relationshipDropdownValue, relationshipJpFromId } from './relationshipOptions';
import { keepRomanji, translateToJp, translateToKatakana } from './translations';
import { formatJpIssueDate } from './kkJpFormat';

function titleCasePart(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildDomisiliId(basic: KkFormData['basic']): string {
  return [basic.kelurahan, basic.kecamatan, basic.kabKota, basic.provinsi]
    .map((s) => titleCasePart(s))
    .filter(Boolean)
    .join(', ');
}

export function syncStApplicantField(
  field: string,
  value: string,
  kkBasic?: KkFormData['basic'],
): Partial<StApplicant> {
  const patch: Partial<StApplicant> = { [field]: value };

  switch (field) {
    case 'name':
      patch.nameJp = keepRomanji(value);
      patch.nameKatakana = translateToKatakana(value);
      break;
    case 'gender': {
      const g = value.toUpperCase();
      if (g === 'L' || g.startsWith('L') || g.includes('LAKI')) patch.gender = 'Laki-laki';
      else if (g === 'P' || g.startsWith('P') || g.includes('PEREMPUAN')) patch.gender = 'Perempuan';
      patch.genderJp = translateToJp('gender', value);
      break;
    }
    case 'nationality':
      patch.nationalityJp = translateToJp('nationality', value);
      break;
    case 'domisili': {
      const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
      const jpParts = parts.map((p, i) => {
        if (i === parts.length - 1) return translateProvinceToJp(p);
        if (i === parts.length - 2) return translateCityToJp(p);
        return translateRegionToJp(p);
      });
      patch.domisiliJp = jpParts.join(', ');
      patch.domisiliKatakana = jpParts.join(', ');
      break;
    }
    case 'ktpIssueDate': {
      const parts = value.split('-');
      if (parts.length === 3) {
        patch.ktpIssueDateJp = formatJpIssueDate(parts[2], parts[1], parts[0]);
      }
      break;
    }
    default:
      break;
  }

  return patch;
}

export function syncStDependentField(field: string, value: string): Partial<StDependent> {
  const patch: Partial<StDependent> = { [field]: value };

  switch (field) {
    case 'name':
      patch.nameJp = keepRomanji(value);
      patch.nameKatakana = translateToKatakana(value);
      break;
    case 'relationship': {
      const isCustom = relationshipDropdownValue(value) === 'LAINNYA';
      patch.relationshipJp = relationshipJpFromId(isCustom ? 'LAINNYA' : value, isCustom ? value : undefined);
      break;
    }
    default:
      break;
  }

  return patch;
}

export function syncStMetaField(
  field: keyof SuratTanggunganFormData,
  value: string,
  kkBasic?: KkFormData['basic'],
): Partial<SuratTanggunganFormData> {
  const patch: Partial<SuratTanggunganFormData> = { [field]: value } as Partial<SuratTanggunganFormData>;

  if (field === 'locationId') {
    patch.locationJp = kkBasic?.kabKotaJp?.trim() || translateCityToJp(value);
  }

  return patch;
}

export function refreshStDomisiliFromKk(
  _applicant: StApplicant,
  kkBasic: KkFormData['basic'],
): Partial<StApplicant> {
  const domisili = buildDomisiliId(kkBasic);
  return {
    domisili,
    domisiliJp: buildDomisiliJpFromParts(kkBasic),
    domisiliKatakana: buildDomisiliKatakanaFromParts(kkBasic),
  };
}
