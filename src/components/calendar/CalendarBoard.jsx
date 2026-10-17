import { useState } from "react";

import ModalShell from "../common/ModalShell";

import {
  weekdayLabels,
  getDaysInMonth,
  getMondayIndex,
  formatDateVN,
} from "../../utils/date";

import { money, statusText } from "../../utils/format";

import { holidayContains, isPersonalHoliday } from "../../utils/holidays";

import {
  getOverviewTone,
  sortOverviewEvents,
} from "../../hooks/useOverviewData";

const panelClass =
  "rounded-3xl border border-slate-200 bg-white p-5 " +
  "dark:border-slate-700 dark:bg-slate-900";

export default function CalendarBoard({
  selectedMonth,
  overview,
  holidays = [],
  onClassHoliday,
  onEditExtra,
  onEditHoliday,
  updateSessionStatus,
  updateExtraStatus,
}) {
  const [selectedDate, setSelectedDate] = useState(null);

  const days = getDaysInMonth(selectedMonth);
  const blankCount = getMondayIndex(days[0]);

  const eventsByDate = new Map();

  for (const item of overview.events) {
    if (!eventsByDate.has(item.date)) {
      eventsByDate.set(item.date, []);
    }

    eventsByDate.get(item.date).push(item);
  }

  function getDayItems(date) {
    const items = [...(eventsByDate.get(date) || [])];

    const personalHolidays = holidays.filter(
      (holiday) => isPersonalHoliday(holiday) && holidayContains(holiday, date),
    );

    // Hiện ngày nghỉ cá nhân dù hôm đó không có buổi học.
    for (const holiday of personalHolidays) {
      items.push({
        id: `holiday:${holiday.id}:${date}`,
        kind: "holiday",
        date,
        time: "",
        title: "Nghỉ cá nhân",
        description: holiday.note || holiday.title || "Nghỉ cả ngày",
        status: "leave",
        amount: 0,
        holidayId: holiday.id,
        allDay: true,
      });
    }

    return items.sort(sortOverviewEvents);
  }

  function editHoliday(item) {
    const holiday = holidays.find((entry) => entry.id === item.holidayId);

    if (!holiday) return;

    setSelectedDate(null);
    onEditHoliday(holiday);
  }

  function editExtra(item) {
    setSelectedDate(null);
    onEditExtra(item.source);
  }

  function bookClassHoliday(item) {
    setSelectedDate(null);
    onClassHoliday(item.source);
  }

  async function cancelEvent(item) {
    if (
      !window.confirm(
        `Bạn có chắc muốn hủy ${item.title} ngày ${formatDateVN(
          item.date,
        )} không?\n\nLịch sẽ được ẩn và không tính thu nhập.`,
      )
    ) {
      return;
    }

    if (item.isExtra) {
      await updateExtraStatus(item.source.id, "cancelled");
    } else if (item.kind === "class") {
      await updateSessionStatus(item.source.key, "cancelled");
    }
  }

  function renderDetails(item) {
    const inactive = ["leave", "covered"].includes(item.status);

    return (
      <article
        key={item.id}
        className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words font-black text-slate-900 dark:text-slate-100">
              {item.title}
            </p>

            <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
              {item.description}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${getOverviewTone(item)}`}
          >
            {item.allDay
              ? "Cả ngày"
              : item.kind === "holiday"
                ? "Lùi buổi"
                : statusText(item.status)}
          </span>
        </div>

        {item.kind !== "holiday" && (
          <p className="mt-3 font-black text-brand-700 dark:text-brand-300">
            {inactive ? "Không tính lương" : money(item.amount)}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {item.kind === "class" && (
            <ActionButton onClick={() => bookClassHoliday(item)}>
              Lớp nghỉ
            </ActionButton>
          )}

          {item.isExtra && (
            <ActionButton onClick={() => editExtra(item)}>Sửa</ActionButton>
          )}

          {item.holidayId && (
            <ActionButton onClick={() => editHoliday(item)}>
              Sửa ngày nghỉ
            </ActionButton>
          )}

          {(item.kind === "class" || item.isExtra) && (
            <ActionButton onClick={() => cancelEvent(item)}>
              Hủy lịch
            </ActionButton>
          )}
        </div>
      </article>
    );
  }

  const visibleSelectedDate = selectedDate;

  const selectedItems = visibleSelectedDate
    ? getDayItems(visibleSelectedDate)
    : [];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="p-4 text-center text-sm font-black text-slate-600 dark:text-slate-300"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: blankCount }, (_, index) => (
                <div
                  key={`blank-${index}`}
                  className="h-[190px] border-b border-r border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                />
              ))}

              {days.map((date) => {
                const items = getDayItems(date);
                const today = date === overview.today;

                const personalOff = holidays.some(
                  (item) =>
                    isPersonalHoliday(item) && holidayContains(item, date),
                );

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    aria-label={`${formatDateVN(date)}, ${items.length} mục. Xem lịch trong ngày`}
                    className={
                      "flex h-[190px] min-w-0 flex-col overflow-hidden border-b border-r " +
                      "border-slate-100 p-2 text-left transition-colors " +
                      "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-brand-500 " +
                      "dark:border-slate-800 sm:p-3 " +
                      (personalOff
                        ? "bg-slate-100 dark:bg-slate-800/50 "
                        : today
                          ? "bg-brand-50 dark:bg-brand-950/30 "
                          : "bg-white dark:bg-slate-900 ") +
                      "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  >
                    <span
                      className={
                        "mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black " +
                        (today
                          ? "bg-brand-600 text-white"
                          : "text-slate-700 dark:text-slate-300")
                      }
                    >
                      {Number(date.slice(-2))}
                    </span>

                    <span className="block w-full space-y-1.5">
                      {items.slice(0, 2).map((item) => (
                        <span
                          key={item.id}
                          title={`${item.title} · ${item.time || "Cả ngày"}`}
                          className={`block rounded-xl px-2 py-2 text-xs font-bold ${getOverviewTone(item)}`}
                        >
                          <span className="block truncate">{item.title}</span>

                          <span className="mt-0.5 block truncate opacity-80">
                            {item.allDay
                              ? "Cả ngày"
                              : `${item.time}${
                                  item.status === "covered"
                                    ? " · Người khác dạy"
                                    : item.status === "leave"
                                      ? " · Nghỉ"
                                      : ""
                                }`}
                          </span>
                        </span>
                      ))}
                    </span>

                    {items.length > 2 && (
                      <span className="mt-auto pt-1 text-xs font-bold text-brand-700 dark:text-brand-300">
                        +{items.length - 2} mục · Xem tất cả
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Legend color="bg-emerald-500" label="Lớp học" />
        <Legend color="bg-violet-500" label="Buổi 5" />
        <Legend color="bg-amber-500" label="Buổi 9" />
        <Legend color="bg-rose-500" label="Buổi 14" />
        <Legend color="bg-slate-400" label="Nghỉ" />
        <Legend color="bg-blue-500" label="Lịch phát sinh" />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        {overview.weeks.map((week) => (
          <section key={week.startDate} className={panelClass}>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {week.title}
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {week.dateLabel}
            </p>

            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto">
              {week.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.date);
                  }}
                  className={`block w-full rounded-2xl p-4 text-left ${getOverviewTone(item)}`}
                  // Mở theo ngày ở phần dưới, kể cả khi khác tháng đang xem.
                  data-event-date={item.date}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-black">{item.title}</p>
                    <p className="text-sm font-bold">
                      {item.status === "leave" ? "Nghỉ" : money(item.amount)}
                    </p>
                  </div>

                  <p className="mt-1 text-sm">
                    {formatDateVN(item.date)} · {item.time}
                  </p>
                </button>
              ))}

              {!week.items.length && (
                <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  Không có lịch phát sinh trong tuần này.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      {visibleSelectedDate && (
        <ModalShell
          title={`Lịch ngày ${formatDateVN(visibleSelectedDate)}`}
          description={`${selectedItems.length} mục trong ngày`}
          onClose={() => setSelectedDate(null)}
        >
          <div className="space-y-3">
            {selectedItems.map(renderDetails)}

            {!selectedItems.length && (
              <p className="rounded-2xl bg-slate-100 p-5 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Không có lịch trong ngày này.
              </p>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
    >
      {children}
    </button>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
