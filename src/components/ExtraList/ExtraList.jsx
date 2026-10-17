import { Plus, Pencil } from "lucide-react";

import CompactRecord, { CompactGrid } from "../common/CompactRecord";

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
const typeOrder = {
  makeup: 0,
  substitute: 1,
  judge: 2,
  trial: 3,
};

function StatusBadge({ status }) {
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
      {statusText(status)}
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
  purgeCancelledExtras,
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

  function purgeCancelledExtras() {
    return perform(async (db) => {
      const snapshot = await getDocsFromServer(
        collection(db, "users", userId, "extras"),
      );

      const references = snapshot.docs
        .filter((item) => item.data().status === "cancelled")
        .map((item) => item.ref);

      for (let index = 0; index < references.length; index += 200) {
        const chunk = references.slice(index, index + 200);

        await runTransaction(db, async (transaction) => {
          const documents = await Promise.all(
            chunk.map((reference) => transaction.get(reference)),
          );

          documents.forEach((document) => {
            // Kiểm tra lại để không xóa lịch đã được đổi trạng thái.
            if (document.exists() && document.data().status === "cancelled") {
              transaction.delete(document.ref);
            }
          });
        });
      }
    });
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
              ? item.classCode || extraTypeLabel(item.type)
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
              summary={formatDateTimeVN(item.datetime)}
              footer={
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-black text-brand-700 dark:text-brand-400">
                    {amountText}
                  </span>

                  <StatusBadge status={item.status} />
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

                    <StatusBadge status={item.status} />
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {emptyMessage || "Chưa có lịch phù hợp."}
        </div>
      )}
    </section>
  );
}
