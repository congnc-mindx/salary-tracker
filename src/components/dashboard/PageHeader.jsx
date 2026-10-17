import { useState } from "react";
import { Bell, Moon, Plus, Sun } from "lucide-react";

import MonthSwitcher from "../MonthSwitcher/MonthSwitcher";
import ModalShell from "../common/ModalShell";
import { currentMonthISO } from "../../utils/date";

const milestoneColors = {
  5: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  9: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  14: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

function formatDate(date) {
  const [year, month, day] = String(date || "").split("-");
  return year && month && day ? `${day}/${month}/${year}` : "";
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="relative inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

export default function PageHeader({
  title,
  subtitle,
  showMonth = false,
  selectedMonth,
  setSelectedMonth,
  actionLabel,
  onAction,
  isDark,
  toggleTheme,
  notifications = [],
  onOpenNotification,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationItems = Array.isArray(notifications) ? notifications : [];

  const hasAction = Boolean(actionLabel && onAction);
  const currentMonth = currentMonthISO();

  return (
    <>
      <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <h1 className="text-3xl font-black text-slate-950 dark:text-slate-100">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 font-semibold text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {showMonth && (
            <>
              <MonthSwitcher
                month={selectedMonth}
                setMonth={setSelectedMonth}
              />

              <button
                type="button"
                onClick={() => setSelectedMonth(currentMonth)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Tháng này
              </button>
            </>
          )}

          {hasAction && (
            <button
              type="button"
              onClick={onAction}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:shadow-none dark:focus-visible:ring-offset-slate-950"
            >
              <Plus size={19} aria-hidden="true" />
              {actionLabel}
            </button>
          )}

          <IconButton
            label={`Thông báo: ${notificationItems.length} lịch sắp tới`}
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={20} aria-hidden="true" />

            {notificationItems.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white ring-2 ring-[#f5f8fc] dark:ring-slate-950">
                {notificationItems.length > 99
                  ? "99+"
                  : notificationItems.length}
              </span>
            )}
          </IconButton>

          <IconButton
            label={
              isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
            }
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun size={20} aria-hidden="true" />
            ) : (
              <Moon size={20} aria-hidden="true" />
            )}
          </IconButton>
        </div>
      </header>

      {showNotifications && (
        <ModalShell
          title="Thông báo"
          description="Các lớp sắp đến buổi 5, buổi 9 và buổi 14 trong 14 ngày tới."
          onClose={() => setShowNotifications(false)}
        >
          {notificationItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center dark:border-slate-700">
              <Bell
                size={26}
                className="mx-auto text-slate-400"
                aria-hidden="true"
              />

              <p className="mt-3 font-bold">Chưa có lớp đến mốc cần nhắc</p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Thông báo sẽ cập nhật theo lịch dạy của bạn.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notificationItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenNotification(item);
                      setShowNotifications(false);
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500"
                  >
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                        milestoneColors[item.sessionNo] ||
                        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      }`}
                    >
                      Buổi {item.sessionNo}
                    </span>

                    <p className="mt-2 font-bold">{item.title}</p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(item.date)}
                      {item.time ? ` · ${item.time}` : ""}
                    </p>

                    <p className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400">
                      Xem tháng này trên lịch
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalShell>
      )}
    </>
  );
}
