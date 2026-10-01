'use client';

import * as React from 'react';
import { 
  format as formatJalali, 
  parse as parseJalali,
  getYear as getJalaliYear,
  getMonth as getJalaliMonth,
  getDate as getJalaliDate,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  addMonths,
  subMonths
} from 'date-fns-jalali';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, X, Check } from 'lucide-react';
import { cn, toFaDigits, toEnDigits } from '@/lib/utils';

export interface PersianDatePickerProps {
  value: string | Date | null | undefined;
  onChange: (isoString: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  includeTime?: boolean;
  className?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
}

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function PersianDatePicker({
  value,
  onChange,
  label,
  placeholder = 'انتخاب تاریخ...',
  error,
  helperText,
  required,
  disabled,
  includeTime = false,
  className,
  minDate,
  maxDate
}: PersianDatePickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse incoming value into a Gregorian Date object
  const selectedDate: Date | null = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // Calendar view state (which month/year is currently visible)
  const [viewDate, setViewDate] = React.useState<Date>(() => selectedDate || new Date());

  // Time state (hours and minutes)
  const [hours, setHours] = React.useState<number>(() => {
    return selectedDate ? selectedDate.getHours() : 18;
  });
  const [minutes, setMinutes] = React.useState<number>(() => {
    return selectedDate ? selectedDate.getMinutes() : 0;
  });

  // Keep viewDate and time in sync when external value changes
  React.useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
      setHours(selectedDate.getHours());
      setMinutes(selectedDate.getMinutes());
    }
  }, [selectedDate]);

  // Close calendar popover on click outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const jalaliYear = getJalaliYear(viewDate);
  const jalaliMonthIndex = getJalaliMonth(viewDate);

  // Calculate days of current month
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Saturday is day 6 in JS standard getDay (0 is Sunday, 6 is Saturday)
  // In Persian calendar, week starts on Saturday (شنبه = index 0)
  const startDayOfWeek = (getDay(monthStart) + 1) % 7;

  // Handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => addMonths(prev, 1));
  };

  const handleSelectDay = (day: Date) => {
    const newDate = new Date(day);
    if (includeTime) {
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate.toISOString());
    } else {
      // Format as YYYY-MM-DD
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const date = String(newDate.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${date}`);
    }
    if (!includeTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHours(newHours);
    setMinutes(newMinutes);
    if (selectedDate) {
      const updated = new Date(selectedDate);
      updated.setHours(newHours, newMinutes, 0, 0);
      onChange(updated.toISOString());
    }
  };

  const handleSetToday = () => {
    const today = new Date();
    setViewDate(today);
    handleSelectDay(today);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Format display string
  const displayLabel = React.useMemo(() => {
    if (!selectedDate) return '';
    try {
      if (includeTime) {
        return `${formatJalali(selectedDate, 'yyyy/MM/dd')} - ساعت ${toFaDigits(String(selectedDate.getHours()).padStart(2, '0'))}:${toFaDigits(String(selectedDate.getMinutes()).padStart(2, '0'))}`;
      }
      return `${toFaDigits(getJalaliDate(selectedDate))} ${PERSIAN_MONTHS[getJalaliMonth(selectedDate)]} ${toFaDigits(getJalaliYear(selectedDate))}`;
    } catch {
      return '';
    }
  }, [selectedDate, includeTime]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1.5 relative">
      {label && (
        <label className="text-xs sm:text-sm font-bold text-[var(--neo-text-secondary)] flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm font-medium transition-all flex items-center justify-between text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "border-blue-500 ring-2 ring-blue-500/20 bg-white",
          error && "border-rose-500 focus:ring-rose-500",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className={cn("truncate", !displayLabel ? "text-slate-400 font-normal" : "text-slate-900 font-bold")}>
            {displayLabel || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 mr-2">
          {displayLabel && !disabled && (
            <span
              role="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-md transition"
              title="پاک کردن تاریخ"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronLeft className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "-rotate-90 text-blue-600")} />
        </div>
      </button>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="ماه بعد"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5 select-none">
              <span>{PERSIAN_MONTHS[jalaliMonthIndex]}</span>
              <span className="font-mono text-blue-600">{toFaDigits(jalaliYear)}</span>
            </div>

            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="ماه قبل"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEK_DAYS.map((wd, i) => (
              <div 
                key={i} 
                className={cn(
                  "text-[11px] font-bold py-1 select-none",
                  i === 6 ? "text-rose-500" : "text-slate-400"
                )}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset placeholders for month start */}
            {[...Array(startDayOfWeek)].map((_, i) => (
              <div key={`blank-${i}`} className="h-8 w-8" />
            ))}

            {/* Month days */}
            {daysInMonth.map((dayDate) => {
              const isSelected = selectedDate ? isSameDay(dayDate, selectedDate) : false;
              const isCurrentDay = isToday(dayDate);
              const dayNum = getJalaliDate(dayDate);

              return (
                <button
                  key={dayDate.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(dayDate)}
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 mx-auto rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all select-none font-mono",
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                      : isCurrentDay
                      ? "border border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {toFaDigits(dayNum)}
                </button>
              );
            })}
          </div>

          {/* Optional Time Picker section */}
          {includeTime && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>زمان:</span>
              </div>

              <div className="flex items-center gap-1 dir-ltr font-mono">
                <select
                  value={hours}
                  onChange={(e) => handleTimeChange(Number(e.target.value), minutes)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[...Array(24)].map((_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="font-bold text-slate-400">:</span>
                <select
                  value={minutes}
                  onChange={(e) => handleTimeChange(hours, Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[0, 15, 30, 45, 59].map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Quick Footer Actions */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-blue-600 font-bold hover:underline py-1 px-2 rounded hover:bg-blue-50 transition"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 font-bold py-1 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {error ? (
        <span className="text-xs font-bold text-rose-500 animate-in fade-in">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[var(--neo-text-muted)]">{helperText}</span>
      ) : null}
    </div>
  );
}
