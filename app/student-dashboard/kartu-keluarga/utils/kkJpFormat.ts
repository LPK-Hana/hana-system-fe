/** Spaced digits like PDF: 3211241511210003 → 3 2 1 1 2 4 … */
export function spaceDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return value || '-';
  return digits.split('').join(' ');
}

/** Normal uppercase name for header/footer (ACIN SUTISNA — not per-letter spaced). */
export function formatJpDisplayName(value: string): string {
  if (!value || value === '-') return '-';
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

/** Spaced Latin letters for table cells only (PDF table rows use light per-letter gaps). */
export function spaceLatinText(value: string): string {
  if (!value || value === '-') return '-';
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.split('').join(' '))
    .join('  ');
}

/** Issue date in footer box — normal digits, not per-digit spaced (per contoh-kk.pdf). */
export function formatJpIssueDate(year?: string, month?: string, day?: string): string {
  if (!year && !month && !day) return '　　年　　月　　日';
  const y = year || '　　　　';
  const m = month ? month.padStart(2, '0') : '　';
  const d = day ? day.padStart(2, '0') : '　';
  return `${y}年 ${m}月 ${d}日`;
}

/** Calendar date like PDF table cells: 1972年 07月 03日 */
export function formatJpCalendarDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr === '-') return '-';
  let raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = raw.split('-');
  if (parts.length === 3) {
    let y: string;
    let m: string;
    let d: string;
    if (parts[0].length === 4) {
      [y, m, d] = parts;
    } else if (parts[2].length === 4) {
      [d, m, y] = parts;
    } else {
      return dateStr;
    }
    return `${y}年 ${m.padStart(2, '0')}月 ${d.padStart(2, '0')}日`;
  }
  return dateStr;
}
