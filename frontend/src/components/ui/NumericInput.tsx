'use client';

import * as React from 'react';
import { cn, toEnDigits, toFaDigits, parseNumericInput } from '@/lib/utils';

export interface NumericInputProps {
  value: number | string | null | undefined;
  onChange: (value: number, rawStr?: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  formatWithCommas?: boolean;
}

export function NumericInput({
  value,
  onChange,
  label,
  placeholder,
  error,
  helperText,
  min,
  max,
  unit,
  required,
  disabled,
  className,
  id,
  name,
  formatWithCommas = true
}: NumericInputProps) {
  // Local display state to allow seamless typing
  const [displayValue, setDisplayValue] = React.useState<string>(() => {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : parseNumericInput(value);
    return formatWithCommas ? toFaDigits(num.toLocaleString('en-US')) : toFaDigits(num.toString());
  });

  // Sync from external value changes if not focused or when value updates externally
  React.useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setDisplayValue('');
      return;
    }
    const num = typeof value === 'number' ? value : parseNumericInput(value);
    const formatted = formatWithCommas ? toFaDigits(num.toLocaleString('en-US')) : toFaDigits(num.toString());
    setDisplayValue(formatted);
  }, [value, formatWithCommas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) {
      setDisplayValue('');
      onChange(0, '');
      return;
    }

    // Convert Persian/Arabic to English
    const en = toEnDigits(raw).replace(/,/g, '').replace(/،/g, '').replace(/[^0-9]/g, '');
    const num = Number(en);

    if (isNaN(num)) {
      setDisplayValue('');
      onChange(0, '');
      return;
    }

    // Format for display with Persian digits and commas
    const formatted = formatWithCommas ? toFaDigits(num.toLocaleString('en-US')) : toFaDigits(en);
    setDisplayValue(formatted);
    onChange(num, en);
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs sm:text-sm font-bold text-[var(--neo-text-secondary)] flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          {unit && <span className="text-[11px] font-normal text-slate-400">({unit})</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          dir="ltr"
          disabled={disabled}
          placeholder={placeholder ? toFaDigits(placeholder) : '۰'}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm sm:text-base font-mono text-left font-bold text-[var(--neo-text-main)] transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed",
            unit && "pl-16 sm:pl-20",
            error && "border-rose-500 focus:ring-rose-500",
            className
          )}
        />
        {unit && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none select-none">
            {unit}
          </div>
        )}
      </div>

      {error ? (
        <span className="text-xs font-bold text-rose-500 animate-in fade-in">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[var(--neo-text-muted)]">{helperText}</span>
      ) : null}
    </div>
  );
}
