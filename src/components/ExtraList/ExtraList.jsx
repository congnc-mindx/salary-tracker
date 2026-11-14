import { getCourseTitle } from "../../utils/courseDisplay";
import EmptyState from "../common/EmptyState";
import { Plus, Pencil } from "lucide-react";

import CompactRecord, { CompactGrid } from "../common/CompactRecord";

import { money, statusText } from "../../utils/format";
import { formatDateTimeVN } from "../../utils/date";
import { getExtraAmount } from "../../services/income";
import {
  getExtraHours,
  extraTitle,
  extraSubtitle,
  extraTypeLabel,
} from "../../utils/extra";

const badges = {
  makeup: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  judge: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  substitute: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  trial: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};
const typeOrder = {
  makeup: 0,
  substitute: 1,
  judge: 2,
  trial: 3,
};

function StatusBadge({ status, autoCompleted }) {
  const color =
    status === "cancelled"
      ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      : status === "confirmed"
        ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${color}`}
    >
      {autoCompleted && status === "confirmed" ? "Đã thực hiện" : statusText(status)}
    </span>
  );
}

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
    .filter(
      (item) => item.status !== "cancelled" && (!type || item.type === type),
    )
    .sort((a, b) => {
      const groupDifference =
        (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);

      if (groupDifference !== 0) return groupDifference;

      return (
        a.datetime.localeCompare(b.datetime) ||
        (a.classCode || "").localeCompare(b.classCode || "", "vi") ||
        String(a.id).localeCompare(String(b.id))
      );
    });

  function cancelItem(item) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn hủy và xóa lịch ${extraTitle(item)} vào ${formatDateTimeVN(
        item.datetime,
      )} không?\n\nLịch sẽ bị xóa khỏi dữ liệu và không thể khôi phục trong ứng dụng.`,
    );

    if (confirmed) {
      updateExtraStatus(item.id, "cancelled");
    }
  }

  return (
    <section>
      {showHeader && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">{title}</h2>

          {openAdd && (
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              <Plus size={18} />
              Book lịch
            </button>
          )}
        </div>
      )}

      {filters}

      <CompactGrid>
        {filtered.map((item) => {
          const excluded = ["cancelled", "leave", "covered"].includes(
            item.status,
          );

          const amountText = excluded
            ? "Không tính"
            : money(getExtraAmount(item, settings));

          const displayTitle =
            showType && item.type !== "trial"
              ? getCourseTitle({ code: item.classCode, campus: item.campus }) ||
                extraTypeLabel(item.type)
              : extraTitle(item);

          return (
            <CompactRecord
              key={item.id}
              title={displayTitle}
              badge={
                showType ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      badges[item.type] || ""
                    }`}
                  >
                    {extraTypeLabel(item.type)}
                  </span>
                ) : null
              }
              summary={
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {formatDateTimeVN(item.datetime)}
                  </p>
                  <p className="text-xs">
                    {getExtraHours(item)} giờ
                    {item.studentCount != null
                      ? ` · ${item.studentCount} học sinh`
                      : ""}
                  </p>
                  {item.note && (
                    <p className="line-clamp-2 text-xs">{item.note}</p>
                  )}
                </div>
              }
              footer={
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="font-black text-brand-700 dark:text-brand-400">
                    {amountText}
                  </span>

                  <StatusBadge status={item.status} autoCompleted={item.autoCompleted} />
                </div>
              }
            >
              {(close) => (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        badges[item.type] || ""
                      }`}
                    >
                      {extraTypeLabel(item.type)}
                    </span>

                    <StatusBadge status={item.status} autoCompleted={item.autoCompleted} />
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {extraSubtitle(item)}
                  </p>

                  <p className="text-xl font-black text-brand-700 dark:text-brand-400">
                    {amountText}
                  </p>

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

                    {item.status !== "cancelled" && updateExtraStatus && (
                      <button
                        type="button"
                        onClick={() => cancelItem(item)}
                        className="min-h-11 rounded-xl bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CompactRecord>
          );
        })}
      </CompactGrid>

      {filtered.length === 0 && (
        <EmptyState>{emptyMessage || "Chưa có lịch phù hợp."}</EmptyState>
      )}
    </section>
  );
}
