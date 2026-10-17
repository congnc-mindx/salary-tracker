import { useState } from "react";
import { Bell, Moon, Plus, Sun } from "lucide-react";

import MonthSwitcher from "../MonthSwitcher/MonthSwitcher";
import ModalShell from "../common/ModalShell";

import { currentMonthISO, formatDateVN } from "../../utils/date";

import { getOverviewTone } from "../../hooks/useOverviewData";

export default function OverviewHeader({
  selectedMonth,
  setSelectedMonth,
  openBooking,
  isDark,
  toggleTheme,
  notifications = [],
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const iconClass =
    "relative inline-flex items-center justify-center rounded-2xl " +
    "border border-slate-200 bg-white p-3 text-slate-600 shadow-sm " +
    "hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-brand-500 " +
    "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 " +
    "dark:hover:bg-slate-800";

  return (
    <>
      <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h2 className="text-2xl font-black sm:text-3xl">
            Tổng quan tháng {Number(selectedMonth.slice(5))}/
            {selectedMonth.slice(0, 4)}
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Theo dõi lịch dạy và thu nhập dự kiến
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MonthSwitcher month={selectedMonth} setMonth={setSelectedMonth} />

          <button
            type="button"
            onClick={() => setSelectedMonth(currentMonthISO())}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Hôm nay
          </button>

          <button
            type="button"
            onClick={openBooking}
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-black text-white hover:bg-brand-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <Plus size={19} />
            Book lịch
          </button>

          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            aria-label={`Thông báo: ${notifications.length} buổi sắp tới`}
            title="Thông báo"
            className={iconClass}
          >
            <Bell size={20} />

            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                {notifications.length > 99 ? "99+" : notifications.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
            }
            title={isDark ? "Chế độ sáng" : "Chế độ tối"}
            className={iconClass}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {showNotifications && (
        <ModalShell
          title="Thông báo lớp học"
          description="Các buổi 5, 9 và 14 trong 14 ngày tới, theo lịch đã điều chỉnh."
          onClose={() => setShowNotifications(false)}
        >
          <div className="space-y-3">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl p-4 ${getOverviewTone(item)}`}
              >
                <p className="font-black">{item.title}</p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDateVN(item.date)} · {item.time}
                </p>

                <p className="mt-2 text-sm">
                  {Number(item.sessionNo) === 14
                    ? "Chuẩn bị buổi cuối khóa."
                    : `Chuẩn bị nội dung kiểm tra buổi ${item.sessionNo}.`}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth(item.date.slice(0, 7));
                    setShowNotifications(false);
                  }}
                  className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold dark:bg-slate-950/40"
                >
                  Xem tháng này trên lịch
                </button>
              </article>
            ))}

            {!notifications.length && (
              <p className="rounded-2xl bg-slate-100 p-5 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Không có buổi 5, 9 hoặc 14 cần chuẩn bị trong 14 ngày tới.
              </p>
            )}
          </div>
        </ModalShell>
      )}
    </>
  );
}
