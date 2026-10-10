import { Bell, CircleHelp, Moon, Plus, Sun } from 'lucide-react';

import MonthSwitcher from '../MonthSwitcher/MonthSwitcher';
import { currentMonthISO } from '../../utils/date';

export default function OverviewHeader({
  selectedMonth,
  setSelectedMonth,
  openTrial,
  isDark,
  toggleTheme,
}) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <h2 className="text-3xl font-black">
          Tổng quan tháng {selectedMonth.slice(5)}/{selectedMonth.slice(0, 4)}
        </h2>

        <p className="mt-1 font-semibold text-slate-500 dark:text-slate-400">
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
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          Hôm nay
        </button>

        <button
          type="button"
          onClick={openTrial}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 dark:shadow-none"
        >
          <Plus size={19} />
          Book lịch
        </button>

        <IconButton label="Thông báo" desktopOnly>
          <Bell size={20} />
        </IconButton>

        <IconButton label="Trợ giúp" desktopOnly>
          <CircleHelp size={20} />
        </IconButton>

        <IconButton
          label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          onClick={toggleTheme}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
      </div>
    </header>
  );
}

function IconButton({ label, children, onClick, desktopOnly = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`${desktopOnly ? 'hidden lg:inline-flex' : 'inline-flex'} items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300`}
    >
      {children}
    </button>
  );
}