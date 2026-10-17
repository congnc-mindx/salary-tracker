import { money } from "../../utils/format";

const EMPTY_LEAVE = {
  coveredCount: 0,
  coveredAmount: 0,
  extraLeaveCount: 0,
  extraLeaveAmount: 0,
  postponedCount: 0,
  postponedAmount: 0,
  unpaidAmount: 0,
};

const panelClass =
  "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm " +
  "dark:border-slate-700 dark:bg-slate-900 sm:p-6";

export default function SalaryPage({
  selectedMonth,
  expectedIncome = 0,
  teacherBreakdown = 0,
  makeupBreakdown = 0,
  substituteBreakdown = 0,
  judgeBreakdown = 0,
  trialBreakdown = 0,
  leaveSummary = EMPTY_LEAVE,
}) {
  const leave = { ...EMPTY_LEAVE, ...leaveSummary };

  const items = [
    {
      key: "class",
      label: "Lớp học",
      amount: teacherBreakdown,
      color: "#10b981",
    },
    {
      key: "makeup",
      label: "Dạy bù",
      amount: makeupBreakdown,
      color: "#3b82f6",
    },
    {
      key: "judge",
      label: "Giám khảo",
      amount: judgeBreakdown,
      color: "#a855f7",
    },
    {
      key: "substitute",
      label: "Dạy thay",
      amount: substituteBreakdown,
      color: "#ec4899",
    },
    {
      key: "trial",
      label: "Dạy trải nghiệm",
      amount: trialBreakdown,
      color: "#f97316",
    },
  ];

  const hasLeave =
    leave.coveredCount > 0 ||
    leave.extraLeaveCount > 0 ||
    leave.postponedCount > 0;

  const monthLabel = selectedMonth
    ? `Tháng ${Number(selectedMonth.slice(5, 7))}/${selectedMonth.slice(0, 4)}`
    : "";

  return (
    <section className="space-y-5 text-slate-900 dark:text-slate-100">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <IncomeCard key={item.key} item={item} />
        ))}
      </div>

      <div className={panelClass}>
        <h3 className="text-lg font-black">Phân bổ thu nhập dự kiến</h3>

        <div className="mt-6 grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            {items.map((item) => {
              const percent =
                expectedIncome > 0 ? (item.amount / expectedIncome) * 100 : 0;

              return (
                <div key={item.key}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 font-bold">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </div>

                    <span className="font-black tabular-nums">
                      {money(item.amount)}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{
                        width: `${Math.min(100, Math.max(0, percent))}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                    {formatPercent(percent)}
                  </p>
                </div>
              );
            })}
          </div>

          <IncomeDonut items={items} total={expectedIncome} />
        </div>
      </div>

      {hasLeave && (
        <div className={panelClass}>
          <h3 className="text-lg font-black">Ảnh hưởng của ngày nghỉ</h3>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {leave.coveredCount > 0 && (
              <SummaryRow
                label="Người khác dạy thay"
                description={`${leave.coveredCount} buổi · Không nhận lương`}
                value={leave.coveredAmount}
                tone="rose"
              />
            )}

            {leave.extraLeaveCount > 0 && (
              <SummaryRow
                label="Lịch phát sinh nghỉ"
                description={`${leave.extraLeaveCount} lịch · Không nhận lương`}
                value={leave.extraLeaveAmount}
                tone="rose"
              />
            )}

            {leave.postponedCount > 0 && (
              <SummaryRow
                label="Giá trị các buổi lùi"
                description={`${leave.postponedCount} buổi · Lương tính vào ngày dạy mới`}
                value={leave.postponedAmount}
                tone="amber"
              />
            )}
          </div>

          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Thu nhập dự kiến đã tính theo lịch sau điều chỉnh. Các khoản ở đây
            chỉ để đối chiếu, không bị trừ thêm. Buổi lùi có thể được dạy lại
            trong cùng tháng hoặc tháng sau.
          </p>
        </div>
      )}
    </section>
  );
}

function IncomeCard({ item }) {
  return (
    <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />

        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {item.label}
        </p>
      </div>

      <p className="mt-3 break-words text-xl font-black tabular-nums text-blue-700 dark:text-blue-400">
        {money(item.amount)}
      </p>
    </article>
  );
}

function SummaryRow({
  label,
  description,
  value,
  prominent = false,
  tone = "default",
}) {
  const valueColor =
    tone === "rose"
      ? "text-rose-600 dark:text-rose-400"
      : tone === "amber"
        ? "text-amber-700 dark:text-amber-400"
        : prominent
          ? "text-blue-700 dark:text-blue-400"
          : "text-slate-900 dark:text-slate-100";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div>
        <p className="font-bold text-slate-600 dark:text-slate-300">{label}</p>

        {description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      <p
        className={`font-black tabular-nums ${valueColor} ${
          prominent ? "text-2xl sm:text-3xl" : "text-lg"
        }`}
      >
        {money(value)}
      </p>
    </div>
  );
}

function formatPercent(value) {
  return `${value.toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  })}%`;
}

function IncomeDonut({ items, total }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const positiveItems = items.filter((item) => item.amount > 0);

  let accumulated = 0;

  const segments =
    total > 0
      ? positiveItems.map((item) => {
          const ratio = item.amount / total;

          const segment = {
            ...item,
            length: ratio * circumference,
            offset: -accumulated * circumference,
            percent: ratio * 100,
          };

          accumulated += ratio;
          return segment;
        })
      : [];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative aspect-square w-full max-w-[300px]">
        <svg
          viewBox="0 0 220 220"
          className="h-full w-full"
          role="img"
          aria-label={
            total > 0
              ? `Phân bổ thu nhập dự kiến, tổng ${money(total)}`
              : "Chưa có thu nhập trong tháng"
          }
        >
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            strokeWidth="24"
            className="stroke-slate-100 dark:stroke-slate-800"
          />

          <g transform="rotate(-90 110 110)">
            {segments.map((item) => (
              <circle
                key={item.key}
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="24"
                strokeDasharray={`${item.length} ${
                  circumference - item.length
                }`}
                strokeDashoffset={item.offset}
              >
                <title>
                  {item.label}: {money(item.amount)} (
                  {formatPercent(item.percent)})
                </title>
              </circle>
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-16 text-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {total > 0 ? "Tổng dự kiến" : "Chưa có thu nhập"}
          </p>

          <p className="mt-2 text-lg font-black tabular-nums text-slate-900 dark:text-slate-100 sm:text-xl">
            {money(total)}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Tỷ trọng theo loại công việc
      </p>
    </div>
  );
}
