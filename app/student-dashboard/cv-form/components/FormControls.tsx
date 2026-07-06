'use client';

type InputMode = 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  error?: string;
  id?: string;
  readOnly?: boolean;
  inputTitle?: string;
  inputMode?: InputMode;
  /** Uppercase saat blur (bukan tiap ketik) — aman di mobile. Default: true kecuali email/date/number/tel. */
  autoUppercase?: boolean;
}

const NO_UPPERCASE_TYPES = new Set(['email', 'date', 'number', 'tel']);

function shouldAutoUppercase(type: string, autoUppercase?: boolean): boolean {
  if (autoUppercase !== undefined) return autoUppercase;
  return !NO_UPPERCASE_TYPES.has(type);
}

export function FormField({
  label, value, onChange, type = 'text',
  placeholder, hint, required, className = '', error, id,
  readOnly = false, inputTitle, inputMode, autoUppercase,
}: FormFieldProps) {
  const uppercaseOnBlur = shouldAutoUppercase(type, autoUppercase);

  const handleChange = (raw: string) => {
    onChange(raw);
  };

  const handleBlur = (raw: string) => {
    if (uppercaseOnBlur && raw !== raw.toUpperCase()) {
      onChange(raw.toUpperCase());
    }
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const raw = e.currentTarget.value;
    onChange(uppercaseOnBlur ? raw.toUpperCase() : raw);
  };

  const base =
    'w-full border rounded-xl px-4 py-3 text-sm text-slate-900 ' +
    'placeholder:text-slate-400 focus:outline-none focus:ring-2 ' +
    'focus:border-transparent transition ' +
    (readOnly ? 'bg-slate-50 cursor-default text-slate-700 ' : 'bg-white ') +
    (error
      ? 'border-red-400 focus:ring-red-400'
      : 'border-slate-200 focus:ring-emerald-500');

  const inputHandlers = {
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleChange(e.target.value),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleBlur(e.target.value),
    onCompositionEnd: handleCompositionEnd,
  };

  return (
    <div id={id} className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          readOnly={readOnly}
          title={inputTitle}
          placeholder={placeholder}
          rows={3}
          className={`${base} resize-none`}
          {...inputHandlers}
        />
      ) : (
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          title={inputTitle}
          inputMode={inputMode}
          placeholder={placeholder}
          className={base}
          {...inputHandlers}
        />
      )}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  className?: string;
  placeholder?: string;
  error?: string;
  id?: string;
}

export function FormSelect({
  label, value, onChange, options,
  required, hint, className = '', placeholder = 'Pilih...', error, id,
}: FormSelectProps) {
  return (
    <div id={id} className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          'w-full border rounded-xl px-4 py-3 text-sm text-slate-900 bg-white ' +
          'focus:outline-none focus:ring-2 focus:border-transparent transition ' +
          'appearance-auto min-h-[46px] ' +
          (error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-slate-200 focus:ring-emerald-500')
        }
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
