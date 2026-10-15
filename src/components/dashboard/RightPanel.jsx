import { money } from "../../utils/format";

export default function RightPanel({
  expectedIncome,
  teacherBreakdown,
  makeupBreakdown,
  judgeBreakdown,
  trialBreakdown,
  substituteBreakdown = 0,
}) {
  const breakdowns = [
    {
      label: "Lớp học",
      color: "bg-emerald-500",
      amount: teacherBreakdown,
    },
    {
      label: "Dạy bù",
      color: "bg-blue-500",
      amount: makeupBreakdown,
    },
    {
      label: "Giám khảo",
      color: "bg-purple-500",
      amount: judgeBreakdown,
    },
    {
      label: "Dạy trải nghiệm",
      color: "bg-orange-500",
      amount: trialBreakdown,
    },
    {
      label: "Dạy thay",
      color: "bg-teal-500",
      amount: substituteBreakdown,
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-lg font-black">Phân bổ thu nhập dự kiến</h3>

      <div className="grid gap-3">
        {breakdowns.map((item) => (
          <BreakdownLine
            key={item.label}
            color={item.color}
            label={item.label}
            amount={item.amount}
            total={expectedIncome}
          />
        ))}
      </div>
    </section>
  );
}

function BreakdownLine({ color, label, amount, total }) {
  const percent = total ? Math.round((amount / total) * 1000) / 10 : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm font-bold">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 shrink-0 rounded-full ${color}`} />
          {label}
        </div>

        <span>{money(amount)}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      <p className="mt-1 text-xs font-bold text-slate-400">{percent}%</p>
    </div>
  );
}
