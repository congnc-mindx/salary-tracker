import { Clock, Save, Wallet, CalendarDays } from "lucide-react";
import { money } from "../../utils/format";

function numeric(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

const colorMap = {
  blue: "bg-blue-600",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
};

export default function TopCards({
  expectedIncome = 0,
  confirmedIncome = 0,
  waitingIncome = 0,
  leaveSummary,
}) {
  const leaveAmount =
    numeric(leaveSummary?.coveredAmount) +
    numeric(leaveSummary?.extraLeaveAmount) +
    numeric(leaveSummary?.postponedAmount);

  const cards = [
    {
      title: "Thu nhập dự kiến",
      value: expectedIncome,
      description: "Tổng thu nhập tháng",
      icon: Wallet,
      color: "blue",
    },
    {
      title: "Đã thực hiện",
      value: confirmedIncome,
      description: "Thu nhập đã thực hiện",
      icon: Save,
      color: "green",
    },
    {
      title: "Còn dự kiến",
      value: waitingIncome,
      description: "Các lịch chưa thực hiện",
      icon: Clock,
      color: "orange",
    },
    {
      title: "Nghỉ",
      value: leaveAmount,
      description: "Giá trị lịch nghỉ và buổi lùi",
      icon: CalendarDays,
      color: "rose",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.title}
            className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white ${colorMap[item.color]}`}
              >
                <Icon size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <p className="mt-1 break-words text-2xl font-black tabular-nums text-slate-950 dark:text-slate-100">
                  {money(numeric(item.value))}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
