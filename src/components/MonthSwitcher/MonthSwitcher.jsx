import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthLabel, nextMonth, prevMonth } from '../../utils/date';

const buttonClass = 'rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800';

export default function MonthSwitcher({ month, setMonth }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMonth(prevMonth(month))}
        aria-label="Tháng trước"
        className={buttonClass}
      >
        <ChevronLeft size={20} />
      </button>

      <span className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        {getMonthLabel(month)}
      </span>

      <button
        type="button"
        onClick={() => setMonth(nextMonth(month))}
        aria-label="Tháng sau"
        className={buttonClass}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}