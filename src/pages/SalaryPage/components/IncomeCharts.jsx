import { money } from "../../../utils/format";
import { getMonthLabel, currentMonthISO } from "../../../utils/date";
import { WORK_TYPES, percent } from "../statisticsModel";
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
  const previous = trend.at(-2),
    current = trend.at(-1);
  return (
    <StatPanel
      title="Thu nhập qua 6 tháng"
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
      <div className="grid grid-cols-6 gap-1 sm:gap-4">
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
              {item.month >= currentMonthISO() ? "Có dự kiến" : ""}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {previous.total > 0
          ? "Tổng tháng đang chọn " +
            (current.total >= previous.total ? "tăng " : "giảm ") +
            percent(Math.abs(current.total - previous.total), previous.total) +
            " so với tổng tháng trước."
          : "Tháng trước chưa có thu nhập trong dữ liệu để tính tỷ lệ thay đổi."}{" "}
        Đây là so sánh tổng theo lịch, có thể bao gồm khoản chưa thực hiện.
      </p>
    </StatPanel>
  );
}
export function CompositionChart({ types, total }) {
  const positiveTypes = types.filter((type) => type.total > 0);
  return (
    <StatPanel
      title="Thu nhập đến từ đâu?"
      description="Tỷ trọng và khối lượng theo loại công việc"
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <svg
            viewBox="0 0 120 120"
            role="img"
            aria-label={"Phân bổ thu nhập: " + money(total)}
            className="h-full w-full"
          >
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              strokeWidth="13"
              className="stroke-slate-100 dark:stroke-slate-800"
            />
            <g transform="rotate(-90 60 60)">
              {positiveTypes.map((type, index) => {
                const length = (type.total / Math.max(1, total)) * 100;
                const start =
                  (positiveTypes
                    .slice(0, index)
                    .reduce((sum, item) => sum + item.total, 0) /
                    Math.max(1, total)) *
                  100;
                return (
                  <circle
                    key={type.key}
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke={type.color}
                    strokeWidth="13"
                    pathLength="100"
                    strokeDasharray={length + " " + (100 - length)}
                    strokeDashoffset={-start}
                  >
                    <title>
                      {type.label}: {money(type.total)} •{" "}
                      {percent(type.total, total)}
                    </title>
                  </circle>
                );
              })}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              TỔNG DỰ KIẾN
            </span>
            <strong className="mt-1 text-sm tabular-nums">
              {money(total)}
            </strong>
          </div>
        </div>
        <div className="w-full min-w-0 space-y-3">
          {types.map((type) => (
            <div
              key={type.key}
              className="flex items-start justify-between gap-2 text-sm"
            >
              <div>
                <p className="flex items-center gap-2 font-bold">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: type.color }}
                  />
                  {type.label}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {type.count} lịch · {type.hours.toLocaleString("vi-VN")} giờ
                </p>
              </div>
              <div className="text-right">
                <strong className="whitespace-nowrap tabular-nums">
                  {money(type.total)}
                </strong>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {percent(type.total, total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StatPanel>
  );
}
export function CampusChart({ campuses, total }) {
  const max = Math.max(1, ...campuses.map((item) => item.total));
  return (
    <StatPanel
      title="Đóng góp theo cơ sở"
      description="Sắp xếp theo tổng thu nhập dự kiến"
    >
      {campuses.length ? (
        <div className="max-h-72 space-y-5 overflow-y-auto pr-1">
          {campuses.map((item) => (
            <div key={item.title}>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <strong className="break-words">{item.title}</strong>
                <span className="font-bold tabular-nums">
                  {money(item.total)}
                </span>
              </div>
              <div className="my-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: (item.total / max) * 100 + "%" }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.count} lịch · {item.hours.toLocaleString("vi-VN")} giờ ·{" "}
                {percent(item.total, total)} tổng thu nhập
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-slate-500">
          Chưa có lịch tính thu nhập trong tháng.
        </p>
      )}
    </StatPanel>
  );
}
