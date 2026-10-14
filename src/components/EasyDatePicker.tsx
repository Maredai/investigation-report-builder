import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';

interface EasyDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  id?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function parseDateString(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim();

  // Try ISO YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) return date;
  }

  // Try Date.parse (e.g. October 14, 2026)
  const timestamp = Date.parse(clean);
  if (!isNaN(timestamp)) {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

export function formatDateToReadable(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export const EasyDatePicker: React.FC<EasyDatePickerProps> = ({
  value,
  onChange,
  required = false,
  placeholder = 'Select date (e.g. October 14, 2026)',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse existing value or default to current date
  const parsedDate = parseDateString(value);
  const today = new Date();

  // View state for month & year navigation in calendar
  const [viewYear, setViewYear] = useState<number>(() =>
    parsedDate ? parsedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    parsedDate ? parsedDate.getMonth() : today.getMonth()
  );

  // Sync calendar view month/year if value changes externally
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [value]);

  // Close calendar popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const selected = new Date(year, month, day);
    onChange(formatDateToReadable(selected));
    setIsOpen(false);
  };

  const handleSetPreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    onChange(formatDateToReadable(target));
  };

  // Calendar day grid calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const leadingBlankDays = (firstDayOfWeek + 6) % 7;

  interface DayCell {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }

  const cells: DayCell[] = [];

  // Previous month trailing days
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = leadingBlankDays - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({
      day: d,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday:
        today.getDate() === d &&
        today.getMonth() === prevMonth &&
        today.getFullYear() === prevYear,
      isSelected:
        parsedDate !== null &&
        parsedDate.getDate() === d &&
        parsedDate.getMonth() === prevMonth &&
        parsedDate.getFullYear() === prevYear,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      isToday:
        today.getDate() === d &&
        today.getMonth() === viewMonth &&
        today.getFullYear() === viewYear,
      isSelected:
        parsedDate !== null &&
        parsedDate.getDate() === d &&
        parsedDate.getMonth() === viewMonth &&
        parsedDate.getFullYear() === viewYear,
    });
  }

  // Next month leading days
  const remainingCells = 42 - cells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({
      day: d,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday:
        today.getDate() === d &&
        today.getMonth() === nextMonth &&
        today.getFullYear() === nextYear,
      isSelected:
        parsedDate !== null &&
        parsedDate.getDate() === d &&
        parsedDate.getMonth() === nextMonth &&
        parsedDate.getFullYear() === nextYear,
    });
  }

  const isBlank = !value.trim();

  // Year choices for dropdown
  const currentYear = today.getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear - 10; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {/* Input Field with Calendar Icon Button */}
      <div className="relative flex items-center">
        {/* Left Calendar Icon Button (Click to pop up calendar) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute inset-y-0 left-0 pl-3.5 pr-2 flex items-center text-black dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors z-10"
          title="Open Calendar Picker"
          aria-label="Open Calendar Picker"
        >
          <CalendarIcon className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Text Input (High contrast, clearly visible in dark/light) */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onClick={() => setIsOpen(true)}
          className={`w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm font-medium rounded-xl border transition-colors focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none text-black dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-400 dark:placeholder-neutral-500 ${
            required && isBlank
              ? 'border-yellow-400 ring-1 ring-yellow-400/40'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
          }`}
        />

        {/* Right Action: Clear Button if value present */}
        {value.trim() && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            title="Clear date"
            aria-label="Clear date"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Date Presets Row */}
      <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-neutral-600 dark:text-neutral-400">
        <span className="flex items-center gap-1 text-black dark:text-neutral-300 font-semibold">
          <Clock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" /> Quick pick:
        </span>
        <button
          type="button"
          onClick={() => handleSetPreset(0)}
          className="px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-yellow-400 hover:text-black transition-colors font-medium text-black dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => handleSetPreset(-1)}
          className="px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-yellow-400 hover:text-black transition-colors font-medium text-black dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
        >
          Yesterday
        </button>
      </div>

      {/* Floating Visual Calendar Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-76 sm:w-80 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header with Month & Year Selectors */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-black hover:bg-yellow-400 hover:text-black dark:text-white dark:hover:bg-neutral-800 transition-colors"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-bold py-1 px-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-400"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx} className="dark:bg-neutral-900 text-black dark:text-white">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-bold py-1 px-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-400"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="dark:bg-neutral-900 text-black dark:text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-black hover:bg-yellow-400 hover:text-black dark:text-white dark:hover:bg-neutral-800 transition-colors"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {DAY_NAMES.map((name) => (
              <span
                key={name}
                className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 py-1 uppercase"
              >
                {name}
              </span>
            ))}
          </div>

          {/* 42-Day Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              let cellClass =
                'h-8 text-xs rounded-lg flex items-center justify-center font-semibold transition-colors cursor-pointer ';

              if (cell.isSelected) {
                cellClass += 'bg-yellow-400 text-black font-bold shadow-xs border border-yellow-500 ring-2 ring-yellow-400';
              } else if (cell.isToday) {
                cellClass +=
                  'ring-2 ring-yellow-400 text-black dark:text-yellow-400 font-bold bg-yellow-100 dark:bg-yellow-950/40 hover:bg-yellow-200';
              } else if (cell.isCurrentMonth) {
                cellClass +=
                  'text-black dark:text-white hover:bg-yellow-100 hover:text-black dark:hover:bg-neutral-800';
              } else {
                cellClass +=
                  'text-neutral-300 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800/40';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelectDay(cell.year, cell.month, cell.day)
                  }
                  className={cellClass}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Bottom Today Button */}
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(formatDateToReadable(now));
                setIsOpen(false);
              }}
              className="text-xs font-bold text-black dark:text-yellow-400 hover:underline"
            >
              Select Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
