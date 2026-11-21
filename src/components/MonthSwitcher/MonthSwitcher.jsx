import MonthPicker from "../common/MonthPicker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { nextMonth, prevMonth } from "../../utils/date";

const buttonClass =
  "inline-flex shrink-0 items-center justify-center rounded-2xl " +
  "border border-slate-200 bg-white p-3 text-slate-600 shadow-sm " +
  "transition-colors hover:bg-slate-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 " +
  "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 " +
  "dark:hover:bg-slate-800";

export default function MonthSwitcher({ month, setMonth }) {
  return (
    <div
      role="group"
      aria-label="Chọn tháng"
      className="flex shrink-0 items-center gap-2"
    >
      <button
        type="button"
        onClick={() => setMonth(prevMonth(month))}
        aria-label="Tháng trước"
        title="Tháng trước"
        className={buttonClass}
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>

      <MonthPicker value={month} onChange={setMonth} />

      <button
        type="button"
        onClick={() => setMonth(nextMonth(month))}
        aria-label="Tháng sau"
        title="Tháng sau"
        className={buttonClass}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
