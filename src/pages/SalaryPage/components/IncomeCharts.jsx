import { money } from "../../../utils/format";
import { getMonthLabel } from "../../../utils/date";
import { WORK_TYPES } from "../statisticsModel";
import StatPanel from "./StatPanel";
const compact = (value) =>
  value >= 1e6
    ? (value / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) +
      " tr"
    : value >= 1e3
      ? (value / 1e3).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) +
        "k"
      : String(value);
export function TrendChart({ trend, selectedMonth, onSelect }) {
  const max = Math.max(1, ...trend.map((item) => item.total));

  return (
    <StatPanel
      title={"Thu nhập 12 tháng · " + selectedMonth.slice(0,4)}
      description="Tổng theo lịch đã điều chỉnh • Chọn cột để xem chi tiết tháng"
    >
      <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {WORK_TYPES.map((type) => (
          <span key={type.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: type.color }}
            />
            {type.label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto pb-2" role="region" aria-label="Biểu đồ 12 tháng, cuộn ngang trên màn hình nhỏ" tabIndex={0}><div className="grid min-w-[720px] grid-cols-12 gap-2">
        {trend.map((item) => (
          <button
            key={item.month}
            type="button"
            onClick={() => onSelect?.(item.month)}
            aria-label={getMonthLabel(item.month) + ": " + money(item.total)}
            aria-pressed={item.month === selectedMonth}
            title={
              getMonthLabel(item.month) +
              ": " +
              money(item.total) +
              " · " +
              item.hours +
              " giờ\n" +
              item.types
                .map((type) => type.label + ": " + money(type.total))
                .join("\n")
            }
            className="group min-w-0 rounded-xl p-1 text-center outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800 sm:p-2"
          >
            <div className="flex h-44 flex-col justify-end border-b border-slate-200 dark:border-slate-700">
              <span className="mb-2 text-[10px] font-bold tabular-nums sm:text-xs">
                {compact(item.total)}
              </span>
              <div
                className="mx-auto flex w-full max-w-14 flex-col-reverse overflow-hidden rounded-t-lg"
                style={{
                  height: Math.max(
                    item.total > 0 ? 3 : 0,
                    (item.total / max) * 140,
                  ),
                }}
              >
                {item.types.map((type) => (
                  <div
                    key={type.key}
                    style={{
                      height:
                        (type.total / Math.max(1, item.total)) * 100 + "%",
                      background: type.color,
                    }}
                  />
                ))}
              </div>
            </div>
            <span
              className={
                "mt-2 block text-xs font-bold " +
                (item.month === selectedMonth
                  ? "text-brand-600 dark:text-brand-400"
                  : "")
              }
            >
              {Number(item.month.slice(5))}/{item.month.slice(2, 4)}
            </span>
            <span className="mt-1 block min-h-4 text-[10px] text-slate-500 dark:text-slate-400">
              {item.waitingCount > 0 ? "Có dự kiến" : ""}
            </span>
          </button>
        ))}
      </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Tháng 1–12 của năm đang chọn · Tổng theo lịch có thể bao gồm phần chưa thực hiện. Chọn cột để chuyển sang thống kê tháng.
      </p>
    </StatPanel>
  );
}
