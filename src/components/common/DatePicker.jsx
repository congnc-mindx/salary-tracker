import { useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { parseDate, toISO } from "../../utils/date";

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDate(value) {
  if (!value) return "Chọn ngày khai giảng";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function DatePicker({ label, value, onChange, min, max }) {
  const id = useId();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => getMonthStart(new Date()));

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const emptyDays = (firstDay.getDay() + 6) % 7;

  const previousMonthLastDate = toISO(new Date(year, month, 0));
  const nextMonthFirstDate = toISO(new Date(year, month + 1, 1));

  const canGoPrevious = !min || previousMonthLastDate >= min;
  const canGoNext = !max || nextMonthFirstDate <= max;

  const today = toISO(new Date());

  function closeCalendar() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function toggleCalendar() {
    if (open) {
      setOpen(false);
      return;
    }

    // Mở tại ngày đã chọn, trong phạm vi cho phép.
    let initialDate = value || today;

    if (min && initialDate < min) initialDate = min;
    if (max && initialDate > max) initialDate = max;

    setViewMonth(getMonthStart(parseDate(initialDate)));
    setOpen(true);
  }

  function changeMonth(offset) {
    setViewMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectDate(date) {
    onChange(date);
    closeCalendar();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      closeCalendar();
    }
  }

  const navigationClass =
    "rounded-xl p-2 text-slate-600 hover:bg-slate-100 " +
    "disabled:cursor-not-allowed disabled:opacity-30 " +
    "disabled:hover:bg-transparent " +
    "focus-visible:outline-2 focus-visible:outline-brand-500 " +
    "dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <div onKeyDown={handleKeyDown}>
      <p
        id={`${id}-label`}
        className="mb-2 font-black text-slate-700 dark:text-slate-200"
      >
        {label}
      </p>

      <button
        ref={triggerRef}
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        onClick={toggleCalendar}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <span id={`${id}-value`}>{formatDate(value)}</span>

        <CalendarDays
          size={20}
          aria-hidden="true"
          className="shrink-0 text-slate-500 dark:text-slate-400"
        />
      </button>

      {open && (
        <div
          id={`${id}-calendar`}
          className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Tháng trước"
              disabled={!canGoPrevious}
              onClick={() => changeMonth(-1)}
              className={navigationClass}
            >
              <ChevronLeft size={20} />
            </button>

            <p
              aria-live="polite"
              className="font-black text-slate-800 dark:text-slate-100"
            >
              Tháng {month + 1}/{year}
            </p>

            <button
              type="button"
              aria-label="Tháng sau"
              disabled={!canGoNext}
              onClick={() => changeMonth(1)}
              className={navigationClass}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <span
                key={day}
                className="py-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400"
              >
                {day}
              </span>
            ))}
          </div>

          <div
            role="group"
            aria-label={`Chọn ngày trong tháng ${month + 1}/${year}`}
            className="grid grid-cols-7 gap-1"
          >
            {Array.from({ length: emptyDays }, (_, index) => (
              <span key={`empty-${index}`} aria-hidden="true" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const date = toISO(new Date(year, month, day));
              const disabled = Boolean(
                (min && date < min) || (max && date > max),
              );
              const selected = date === value;
              const isToday = date === today;

              const colorClass = disabled
                ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
                : selected
                  ? "bg-brand-600 text-white hover:bg-brand-hover"
                  : "text-slate-700 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800";

              return (
                <button
                  key={date}
                  type="button"
                  disabled={disabled}
                  aria-label={`Ngày ${day} tháng ${month + 1} năm ${year}`}
                  aria-pressed={selected}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => selectDate(date)}
                  className={`min-h-10 rounded-xl py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${colorClass} ${
                    isToday && !selected
                      ? "ring-1 ring-inset ring-brand-400"
                      : ""
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {min && max && (
            <p className="mt-3 border-t border-slate-100 pt-3 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Từ {formatDate(min)} đến {formatDate(max)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
