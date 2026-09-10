'use client';

import React from 'react';
import {
  KK_RELATIONSHIP_OPTIONS,
  relationshipCustomText,
  relationshipDisplayJp,
  relationshipDropdownValue,
  relationshipJpFromId,
  normalizeRelationshipId,
} from '../utils/relationshipOptions';
import { PreservedTextInput } from './PreservedTextInput';

interface RelationshipFieldProps {
  value: string;
  valueJp?: string;
  isJp?: boolean;
  onChange: (relationshipId: string, relationshipJp: string) => void;
  className?: string;
  inputClassName?: string;
}

export const RelationshipField: React.FC<RelationshipFieldProps> = ({
  value,
  valueJp,
  isJp = false,
  onChange,
  className = '',
  inputClassName = '',
}) => {
  const dropdownVal = relationshipDropdownValue(value);
  const isCustom = dropdownVal === 'LAINNYA';
  const customText = relationshipCustomText(value);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (!selected) {
      onChange('', '');
      return;
    }
    if (selected === 'LAINNYA') {
      onChange('LAINNYA', 'その他');
      return;
    }
    const jp = relationshipJpFromId(selected);
    onChange(normalizeRelationshipId(selected), jp);
  };

  const handleCustom = (val: string) => {
    if (isJp) {
      onChange(val, val);
      return;
    }
    onChange(val, relationshipJpFromId('LAINNYA', val));
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <select className={inputClassName} value={dropdownVal} onChange={handleSelect}>
        <option value="">— Pilih —</option>
        {KK_RELATIONSHIP_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {isJp ? opt.jp : `${opt.labelId} (${opt.jp})`}
          </option>
        ))}
      </select>
      {isCustom ? (
        <PreservedTextInput
          className={inputClassName}
          value={isJp ? (valueJp || customText || value) : (customText || (value !== 'LAINNYA' ? value : ''))}
          onChange={handleCustom}
          uppercase={!isJp}
          placeholder="Ketik hubungan lainnya..."
        />
      ) : null}
      {!isJp && value && !isCustom ? (
        <p className="text-[9px] text-slate-400">JP: {relationshipDisplayJp(value, valueJp)}</p>
      ) : null}
    </div>
  );
};
