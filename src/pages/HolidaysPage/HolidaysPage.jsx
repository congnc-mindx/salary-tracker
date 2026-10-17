import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDateVN } from "../../utils/date";
import { isPersonalHoliday } from "../../utils/holidays";

export default function HolidaysPage({
  holidays,
  courses,
  openAdd,
  onEdit,
  deleteHoliday,
}) {
  const items = [...holidays].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );

  return (
    <section>
      <div className="space-y-3">
        {items.map((item) => {
          const personal = isPersonalHoliday(item);
          const course = courses.find((course) => course.id === item.applyTo);

          return (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {personal
                      ? "Nghỉ cá nhân"
                      : `Lớp nghỉ · ${course?.code || "Lớp đã xóa"}`}
                  </span>

                  <p className="mt-3 font-black text-slate-900 dark:text-slate-100">
                    {formatDateVN(item.startDate)}
                    {item.startDate !== item.endDate &&
                      ` → ${formatDateVN(item.endDate)}`}
                  </p>

                  {(item.note || item.title) && (
                    <p className="mt-2 break-words text-sm text-slate-500 dark:text-slate-400">
                      {item.note || item.title}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  >
                    <Pencil size={16} />
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteHoliday(item.id)}
                    className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!items.length && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Chưa có ngày nghỉ.
          </div>
        )}
      </div>
    </section>
  );
}
