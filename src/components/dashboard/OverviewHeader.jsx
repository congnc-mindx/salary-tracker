import { Bell, CircleHelp, Moon, Plus } from 'lucide-react';

import MonthSwitcher from '../MonthSwitcher/MonthSwitcher';
import { currentMonthISO } from '../../utils/date';

export default function OverviewHeader({
  selectedMonth,
  setSelectedMonth,
  openTrial,
}) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <h2 className="text-3xl font-black">
          Tổng quan tháng {selectedMonth.slice(5)}/{selectedMonth.slice(0, 4)}
        </h2>
        <p className="mt-1 font-semibold text-slate-500">
          Theo dõi lịch dạy và thu nhập dự kiến
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MonthSwitcher
          month={selectedMonth}
          setMonth={setSelectedMonth}
        />

        <button
          type="button"
          onClick={() => setSelectedMonth(currentMonthISO())}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm"
        >
          Hôm nay
        </button>

        <button
          type="button"
          onClick={openTrial}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-200"
        >
          <Plus size={19} />
          Book lịch
        </button>

        <IconButton label="Thông báo"><Bell size={20} /></IconButton>
        <IconButton label="Trợ giúp"><CircleHelp size={20} /></IconButton>
        <IconButton label="Chế độ tối"><Moon size={20} /></IconButton>
      </div>
    </header>
  );
}

function IconButton({ label, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="hidden rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm lg:block"
    >
      {children}
    </button>
  );
}