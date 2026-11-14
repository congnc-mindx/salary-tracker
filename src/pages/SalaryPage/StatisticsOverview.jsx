import { percent } from "./statisticsModel";
import { useState } from "react";
import { money } from "../../utils/format";
import { formatDateVN, getMonthLabel } from "../../utils/date";
import useStatistics from "./useStatistics";
import StatPanel from "./components/StatPanel";
import {
  TrendChart,
} from "./components/IncomeCharts";
import { SourceProgress, ContributionCard } from "./components/ContributionPanels";
import ModalShell from "../../components/common/ModalShell";

export default function SalaryPage({
  selectedMonth,
  mode = "month",
  onSelectMonth,
  courses = [],
  sessions = [],
  extras = [],
  holidays = [],
  skippedHolidays = [],
  settings,
}) {
  const stats = useStatistics({
    selectedMonth,
    mode,
    courses,
    sessions,
    extras,
    holidays,
    skippedHolidays,
    settings,
  });
  const [leaveOpen, setLeaveOpen] = useState(null);
  const cards = [
    {
      label: "Tổng thu nhập dự kiến",
      value: money(stats.total),
      detail: (mode === "year" ? "Năm " + selectedMonth.slice(0,4) : getMonthLabel(selectedMonth)) + " · Lịch sau điều chỉnh",
      primary: true,
    },
    {
      label: "Đã ghi nhận",
      value: money(stats.confirmed),
      detail:
        stats.confirmedCount +
        " lịch · " +
        percent(stats.confirmed, stats.total) +
        " tổng kỳ",
    },
    {
      label: "Còn dự kiến",
      value: money(stats.waiting),
      detail:
        stats.waitingCount +
        " lịch · " +
        stats.waitingHours.toLocaleString("vi-VN") +
        " giờ",
    },
    {
      label: "Khối lượng giảng dạy",
      value: stats.hours.toLocaleString("vi-VN") + " giờ",
      detail:
        stats.count +
        " lịch · " +
        stats.confirmedHours.toLocaleString("vi-VN") +
        " giờ đã ghi nhận",
    },
  ];
  const unpaid = stats.unpaid.reduce((sum, item) => sum + item.amount, 0),
    postponed = stats.postponed.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className={
              "min-w-0 rounded-2xl border p-5 " +
              (card.primary
                ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950"
                : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900")
            }
          >
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {card.label}
            </p>
            <p className="mt-3 whitespace-nowrap text-2xl font-black tabular-nums">
              {card.value}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {card.detail}
            </p>
          </article>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        “Đã ghi nhận” theo trạng thái lịch học, không phải xác nhận đã nhận
        tiền. Lịch cũ có thể được hệ thống tự ghi nhận theo ngày.
      </p>
      {mode === "year" && <TrendChart trend={stats.trend} selectedMonth={selectedMonth} onSelect={onSelectMonth} />}
      <SourceProgress stats={stats} mode={mode}/>
      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <ContributionCard title="Đóng góp theo cơ sở" items={stats.campuses} total={stats.total} campus />
        <ContributionCard title={mode === "year" ? "Lớp đóng góp trong năm" : "Lớp đóng góp trong tháng"} items={stats.classes} total={stats.total}/>
      </div>
      {stats.hours > 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bình quân trên giờ dạy:{" "}
          <strong className="text-slate-800 dark:text-slate-200">
            {money(stats.total / stats.hours)}/giờ
          </strong>{" "}
          · Theo tổng lịch, chưa tính thời gian soạn bài, nhận xét và di chuyển.
        </p>
      )}
      <StatPanel
        title="Ảnh hưởng của ngày nghỉ"
        description="Đối chiếu riêng • Các khoản dưới đây không bị trừ thêm vào tổng"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              key: "unpaid",
              title: "Không nhận lương",
              amount: unpaid,
              count: stats.unpaid.length,
              description: "Người khác dạy thay hoặc lịch phát sinh nghỉ",
              color: "text-rose-600 dark:text-rose-400",
            },
            {
              key: "postponed",
              title: "Buổi bị lùi",
              amount: postponed,
              count: stats.postponed.length,
              description:
                "Lương theo ngày dạy mới, không mặc định là mất thu nhập",
              color: "text-amber-700 dark:text-amber-400",
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={!item.count}
              onClick={() => setLeaveOpen(item.key)}
              className="rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50 focus-visible:outline-brand-500 disabled:cursor-default dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <span className="text-sm font-bold">
                {item.title} · {item.count} lịch
              </span>
              <strong
                className={"my-2 block text-xl tabular-nums " + item.color}
              >
                {money(item.amount)}
              </strong>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {item.description}
                {item.count > 0 ? " · Xem chi tiết →" : ""}
              </span>
            </button>
          ))}
        </div>
      </StatPanel>
      {leaveOpen && (
        <ModalShell
          title={
            leaveOpen === "unpaid"
              ? "Các lịch không nhận lương"
              : "Các buổi bị lùi"
          }
          onClose={() => setLeaveOpen(null)}
        >
          <div className="space-y-3">
            {stats[leaveOpen].map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <strong>{item.courseCode || item.title}</strong>
                  <strong>{money(item.amount)}</strong>
                </div>
                <p className="mt-2 text-sm">
                  {formatDateVN(item.date)}
                  {item.sessionNo ? " · Buổi " + item.sessionNo : ""}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {leaveOpen === "unpaid"
                    ? item.reason
                    : item.nextDate
                      ? "Ngày mới: " +
                        formatDateVN(item.nextDate) +
                        (item.nextDate.startsWith(selectedMonth)
                          ? " · Trong cùng tháng"
                          : " · Ngoài tháng đang xem")
                      : "Chưa xác định ngày dạy mới"}
                </p>
              </article>
            ))}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
