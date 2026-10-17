import { Pencil, Trash2 } from "lucide-react";

import CompactRecord, {
  CompactGrid,
} from "../../components/common/CompactRecord";

import { formatDateVN } from "../../utils/date";
import { isPersonalHoliday } from "../../utils/holidays";

export default function HolidaysPage({
  holidays = [],
  courses = [],
  onEdit,
  deleteHoliday,
}) {
  const items = [...holidays].sort((a, b) => {
    const groupA = isPersonalHoliday(a) ? 0 : 1;
    const groupB = isPersonalHoliday(b) ? 0 : 1;

    return (
      groupA - groupB ||
      a.startDate.localeCompare(b.startDate) ||
      String(a.id).localeCompare(String(b.id))
    );
  });

  return (
    <section>
      <CompactGrid>
        {items.map((item) => {
          const personal = isPersonalHoliday(item);
          const course = courses.find((course) => course.id === item.applyTo);

          const title = personal
            ? "Nghỉ cá nhân"
            : `Lớp nghỉ · ${course?.code || "Lớp đã xóa"}`;

          const endDate = item.endDate || item.startDate;

          const dateText =
            item.startDate === endDate
              ? formatDateVN(item.startDate)
              : `${formatDateVN(item.startDate)} → ${formatDateVN(endDate)}`;

          return (
            <CompactRecord
              key={item.id}
              title={title}
              summary={dateText}
              badge={
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {personal ? "Nghỉ cá nhân" : "Nghỉ theo lớp"}
                </span>
              }
            >
              {(close) => (
                <div className="space-y-5">
                  <p className="font-bold">{dateText}</p>

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
                        onClick={() => deleteHoliday(item.id)}
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
      </CompactGrid>

      {!items.length && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Chưa có ngày nghỉ.
        </div>
      )}
    </section>
  );
}
