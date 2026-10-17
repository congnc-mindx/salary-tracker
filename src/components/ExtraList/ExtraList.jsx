import { Plus, Pencil } from "lucide-react";

import { money, statusText } from "../../utils/format";
import { formatDateTimeVN } from "../../utils/date";
import { getExtraAmount } from "../../services/income";

import { extraTitle, extraSubtitle, extraTypeLabel } from "../../utils/extra";

const badges = {
  makeup: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  judge: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  substitute: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  trial: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export default function ExtraList({
  title,
  type,
  extras = [],
  settings,
  openAdd,
  onEdit,
  updateExtraStatus,
  filters = null,
  emptyMessage,
  showType = false,
  showHeader = true,
}) {
  const filtered = extras
    .filter((item) => !type || item.type === type)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  return (
    <section>
      {showHeader && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">{title}</h2>

          {openAdd && (
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <Plus size={18} />
              Book lịch
            </button>
          )}
        </div>
      )}

      {filters}

      <div className="space-y-3">
        {filtered.map((item) => {
          const cancelled = item.status === "cancelled";
          const onLeave = item.status === "leave";

          const statusClass = cancelled
            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
            : item.status === "confirmed"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words font-black">
                      {showType && item.type !== "trial"
                        ? item.classCode || extraTypeLabel(item.type)
                        : extraTitle(item)}
                    </p>

                    {showType && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          badges[item.type] || ""
                        }`}
                      >
                        {extraTypeLabel(item.type)}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {extraSubtitle(item)}
                  </p>

                  <p className="mt-2 font-black text-brand-700 dark:text-brand-400">
                    {cancelled || onLeave
                      ? "Không tính"
                      : money(getExtraAmount(item, settings))}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${statusClass}`}
                  >
                    {statusText(item.status)}
                  </span>

                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-black text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900"
                    >
                      <Pencil size={16} />
                      Sửa
                    </button>
                  )}

                  {!cancelled && (
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Bạn có chắc muốn hủy lịch ${extraTitle(
                            item,
                          )} vào ${formatDateTimeVN(
                            item.datetime,
                          )} không?\n\nLịch bị hủy sẽ không tính vào thu nhập.`,
                        );

                        if (confirmed) {
                          updateExtraStatus(item.id, "cancelled");
                        }
                      }}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500 hover:bg-red-50 hover:text-red-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {emptyMessage ||
              (title
                ? `Chưa có lịch ${title.toLowerCase()}.`
                : "Chưa có lịch phát sinh.")}
          </div>
        )}
      </div>
    </section>
  );
}
