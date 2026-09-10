'use client';

import React, { useLayoutEffect, useRef } from 'react';

interface PreservedTextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** Transform ke uppercase saat mengetik tanpa memindahkan kursor */
  uppercase?: boolean;
}

/**
 * Input teks yang mempertahankan posisi kursor saat nilai dikontrol ulang
 * (mis. setelah .toUpperCase() atau sinkron state React).
 */
export const PreservedTextInput: React.FC<PreservedTextInputProps> = ({
  value,
  onChange,
  uppercase = false,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const raw = el.value;
    const next = uppercase ? raw.toUpperCase() : raw;
    const start = el.selectionStart ?? next.length;
    caretRef.current = start + (next.length - raw.length);
    onChange(next);
  };

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || caretRef.current === null) return;
    const pos = Math.max(0, Math.min(caretRef.current, value.length));
    el.setSelectionRange(pos, pos);
    caretRef.current = null;
  });

  return (
    <input
      ref={inputRef}
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
};
