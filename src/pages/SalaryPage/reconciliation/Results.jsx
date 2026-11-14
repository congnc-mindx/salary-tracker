import { money } from "../../../utils/format";
import { GROUPS, TYPES } from "./model";
const delta = (n) => `${n > 0 ? "+" : ""}${money(n)}`;
export default function Results({ items, onSelect }) {
  if (!items.length)
    return (
      <p
        role="status"
        className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm dark:border-slate-700"
      >
        Không có mục trong nhóm đang chọn.
      </p>
    );
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const r = item.source || item.expected;
        const resolved = item.decision?.status === "resolved";
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className="grid w-full min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-brand-500 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-words font-black">
                  {r.classKey || r.title}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {TYPES[r.type]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {r.date.split("-").reverse().join("/")} · {r.time}
                {item.source ? ` · STT ${item.source.stt}` : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Web
                </span>
                <strong>
                  {item.expected ? money(item.expected.total) : "Chưa có"}
                </strong>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Trung tâm
                </span>
                <strong>
                  {item.source ? money(item.source.total) : "Chưa thấy"}
                </strong>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${resolved || item.group === "matched" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}
                >
                  {resolved
                    ? "Đã xác minh"
                    : item.decision?.status === "ask"
                      ? "Cần hỏi trung tâm"
                      : GROUPS[item.group]}
                </span>
                <strong
                  className={
                    item.delta
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-slate-500 dark:text-slate-400"
                  }
                >
                  {delta(item.delta)}
                </strong>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {item.decision?.note ||
                  item.issues.join(" · ") ||
                  "Mở để xem chi tiết"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
