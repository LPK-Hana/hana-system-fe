interface CvMensetsuControlsProps {
  useMensetsu: boolean;
  onUseMensetsuChange: (value: boolean) => void;
  interviewNumber: string;
  onInterviewNumberChange: (value: string) => void;
  /** Untuk bulk: jelaskan nomor awal yang akan naik per siswa */
  bulkHint?: boolean;
}

export default function CvMensetsuControls({
  useMensetsu,
  onUseMensetsuChange,
  interviewNumber,
  onInterviewNumberChange,
  bulkHint = false,
}: CvMensetsuControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-emerald-50 px-4 py-2 rounded-md border border-emerald-100">
      <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-emerald-800 select-none">
        <input
          type="checkbox"
          checked={useMensetsu}
          onChange={e => onUseMensetsuChange(e.target.checked)}
          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
        />
        No. Mensetsu
      </label>
      {useMensetsu && (
        <div className="flex flex-col gap-0.5">
          <input
            id="mensetsu_no"
            type="text"
            inputMode="numeric"
            value={interviewNumber}
            onChange={e => onInterviewNumberChange(e.target.value)}
            placeholder={bulkHint ? 'Nomor awal, mis. 4' : 'Misal: 4'}
            className="w-28 px-2 py-1 text-sm border border-emerald-200 rounded text-center text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {bulkHint && (
            <span className="text-[10px] text-emerald-700/80 leading-tight">
              Nomor naik otomatis per siswa (4, 5, 6…)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Nomor mensetsu untuk siswa ke-n (bulk: mulai dari nomor awal). */
export function resolveInterviewNumber(
  useMensetsu: boolean,
  interviewNumber: string,
  index = 0,
): string | undefined {
  if (!useMensetsu) return undefined;
  const trimmed = interviewNumber.trim();
  if (!trimmed) return undefined;
  const start = parseInt(trimmed, 10);
  if (Number.isNaN(start)) return trimmed;
  return String(start + index);
}
