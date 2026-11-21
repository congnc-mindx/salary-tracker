import usePayrollLedger from "../../hooks/usePayrollLedger";
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
  userId, selectedMonth,
  expectedIncome = 0,
  confirmedIncome = 0,
  waitingIncome = 0,
  leaveSummary,
}) {
  const {value:payroll,error} = usePayrollLedger(userId,selectedMonth || "2026-01");
  if(payroll) expectedIncome=payroll.gross;
  const leaveAmount =
    numeric(leaveSummary?.coveredAmount) +
    numeric(leaveSummary?.extraLeaveAmount) +
    numeric(leaveSummary?.postponedAmount);

  const cards = [
    {
      title: payroll ? "Công theo bảng lương" : "Thu nhập dự kiến",
      value: expectedIncome,
      description: "Tổng thu nhập tháng",
      icon: Wallet,
      color: "blue",
    },
    {
      title: "Thực lĩnh dự kiến",
      value: payroll ? payroll.net : expectedIncome - Math.round(expectedIncome * 0.1),
      description: payroll?.actualTax ? "Theo bảng lương đã nhập" : "Ước tính sau khấu trừ 10%",
      icon: Save,
      color: "green",
    },
    {
      title: payroll?.actualTax ? "Thuế đã khấu trừ" : "Thuế dự kiến",
      value: payroll ? payroll.tax : Math.round(expectedIncome * 0.1),
      description: payroll?.actualTax ? "Theo số thuế đã nhập" : "Ước tính 10% tiền công",
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
      {error && <p role="alert" className="col-span-full text-sm text-red-500">Chưa tải được bảng lương; đang hiển thị dự kiến từ lịch dạy.</p>}
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
                  {item.value == null ? "Chưa nhập" : money(numeric(item.value))}
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
