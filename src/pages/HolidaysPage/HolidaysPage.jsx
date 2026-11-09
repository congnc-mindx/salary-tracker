import { useState } from "react";
import { getCourseTitle } from "../../utils/courseDisplay";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { filterHolidaysByMonth } from "../../utils/dateRange";
import { Pencil, Trash2 } from "lucide-react";

import CompactRecord from "../../components/common/CompactRecord";

import { formatDateVN, getMonthLabel, currentMonthISO } from "../../utils/date";
import { isPersonalHoliday } from "../../utils/holidays";

export default function HolidaysPage({
  selectedMonth = currentMonthISO(),
  openAdd,
  holidays = [],
  courses = [],
  onEdit,
  deleteHoliday,
}) {
  const [view, setView] = useState("timeline");
  const items = filterHolidaysByMonth(holidays, selectedMonth);
  const courseMap = new Map(courses.map((course) => [course.id, course]));

  return (
    <section>
      <p
        role="status"
        className="mb-4 text-sm text-slate-500 dark:text-slate-400"
      >
        {getMonthLabel(selectedMonth)} · {items.length} khoảng nghỉ
      </p>
      <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {[
          ["timeline", "Dòng thời gian"],
          ["cards", "Thẻ cũ"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => setView(key)}
            className={`min-h-11 rounded-lg px-4 text-sm font-bold ${view === key ? "bg-brand-600 text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            {key === "timeline" ? "Dòng thời gian" : label}
          </button>
        ))}
      </div>
      <div
        className={
          view === "timeline"
            ? "grid gap-3"
            : "grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3"
        }
      >
        {items.map((item) => {
          const personal = isPersonalHoliday(item);
          const course = courseMap.get(item.applyTo);

          const endDate = item.endDate || item.startDate;

          const dateText =
            item.startDate === endDate
              ? formatDateVN(item.startDate)
              : `${formatDateVN(item.startDate)} → ${formatDateVN(endDate)}`;

          return (
            <CompactRecord
              key={item.id}
              title={dateText}
              preview={
                view === "timeline" ? (
                  <div className="flex w-full items-center gap-4">
                    <div
                      className={`flex w-16 shrink-0 flex-col items-center rounded-xl py-3 ${personal ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}
                    >
                      <span className="text-2xl font-black">
                        {item.startDate.slice(8)}
                      </span>
                      <span className="text-xs font-bold">
                        Tháng {Number(item.startDate.slice(5, 7))}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-black">
                        {personal
                          ? "Nghỉ cá nhân"
                          : getCourseTitle(course) || "Lớp đã xóa"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {dateText}
                      </p>
                      {(item.note || item.title) && (
                        <p className="mt-1 line-clamp-2 break-words text-sm text-slate-500 dark:text-slate-400">
                          {item.note || item.title}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {personal
                          ? "Áp dụng các lớp trong khoảng nghỉ"
                          : "Lớp nghỉ · Lùi lịch học"}
                        {item.startDate.slice(0, 7) !== selectedMonth ||
                        endDate.slice(0, 7) !== selectedMonth
                          ? " · Qua tháng khác"
                          : ""}
                      </p>
                    </div>
                    <span aria-hidden="true" className="text-xl text-slate-400">
                      ›
                    </span>
                  </div>
                ) : null
              }
              summary={
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {personal
                      ? "Tất cả lớp trong khoảng nghỉ"
                      : course?.code || "Lớp đã xóa"}
                  </p>
                  {!personal && course?.campus && (
                    <p className="text-xs">{course.campus}</p>
                  )}
                  <p className="line-clamp-2 min-h-10 text-sm">
                    {item.note || item.title || "Chưa thêm ghi chú"}
                  </p>
                </div>
              }
              footer={
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
                  <span>
                    {item.startDate.slice(0, 7) !== selectedMonth ||
                    endDate.slice(0, 7) !== selectedMonth
                      ? "Kéo dài qua tháng khác"
                      : "Trong tháng đang xem"}
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    Xem chi tiết
                  </span>
                </div>
              }
              badge={
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${personal ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}
                >
                  {personal ? "Nghỉ cá nhân" : "Nghỉ theo lớp"}
                </span>
              }
            >
              {(close) => (
                <div className="space-y-5">
                  <p className="font-bold">
                    {personal
                      ? "Nghỉ cá nhân"
                      : `Nghỉ theo lớp · ${course?.code || "Lớp đã xóa"}`}
                  </p>

                  {!personal && course?.campus && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Cơ sở: {course.campus}
                    </p>
                  )}

                  {(item.note || item.title) && (
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {item.note || item.title}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-end gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          onEdit(item);
                        }}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-brand-50 px-4 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900"
                      >
                        <Pencil size={16} />
                        Sửa
                      </button>
                    )}

                    {deleteHoliday && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              "Xóa khoảng nghỉ này? Lịch dạy và thu nhập liên quan sẽ được tính lại.",
                            )
                          )
                            return;
                          if (await deleteHoliday(item.id)) close();
                        }}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CompactRecord>
          );
        })}
      </div>

      {!items.length && (
        <EmptyState
          action={
            openAdd && (
              <Button variant="primary" onClick={openAdd}>
                Thêm ngày nghỉ
              </Button>
            )
          }
        >
          Không có ngày nghỉ trong {getMonthLabel(selectedMonth).toLowerCase()}.
          Chuyển tháng để xem lịch nghỉ khác.
        </EmptyState>
      )}
    </section>
  );
}
