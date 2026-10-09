import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getMonthLabel,
  nextMonth,
  prevMonth,
} from '../../utils/date';

export default function MonthSwitcher({ month, setMonth }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMonth(prevMonth(month))}
        aria-label="Tháng trước"
        className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-700 shadow-sm">
        {getMonthLabel(month)}
      </span>

      <button
        type="button"
        onClick={() => setMonth(nextMonth(month))}
        aria-label="Tháng sau"
        className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}