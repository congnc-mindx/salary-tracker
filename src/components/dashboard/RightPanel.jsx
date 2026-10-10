import { Download } from 'lucide-react';
import clsx from 'clsx';
import { money, statusText } from '../../utils/format';

export default function RightPanel({
  expectedIncome,
  teacherBreakdown,
  makeupBreakdown,
  judgeBreakdown,
  trialBreakdown,
  upcomingFuture,
  pastThisMonth,
}) {
  const breakdowns = [
    {
      label: 'Lớp học',
      color: 'bg-emerald-500',
      amount: teacherBreakdown,
    },
    {
      label: 'Dạy bù',
      color: 'bg-blue-500',
      amount: makeupBreakdown,
    },
    {
      label: 'Giám khảo',
      color: 'bg-purple-500',
      amount: judgeBreakdown,
    },
    {
      label: 'Trial',
      color: 'bg-orange-500',
      amount: trialBreakdown,
    },
  ];

  return (
    <aside className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-black">
          Phân bổ thu nhập dự kiến
        </h3>

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

        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-black text-blue-700"
        >
          <Download size={18} />
          Xem chi tiết thống kê
        </button>
      </div>

      <SmallScheduleCard
        title="Lịch sắp tới"
        items={upcomingFuture}
      />

      <SmallScheduleCard
        title="Lịch trong quá khứ tháng này"
        items={pastThisMonth}
      />

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-4 font-black text-blue-700 shadow-sm"
      >
        <Download size={18} />
        Xuất báo cáo tháng
      </button>
    </aside>
  );
}

function BreakdownLine({ color, label, amount, total }) {
  const percent = total
    ? Math.round((amount / total) * 1000) / 10
    : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm font-bold">
        <div className="flex items-center gap-2">
          <span className={clsx('h-3 w-3 rounded-full', color)} />
          {label}
        </div>

        <span>{money(amount)}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={clsx('h-full rounded-full', color)}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-1 text-xs font-bold text-slate-400">
        {percent}%
      </p>
    </div>
  );
}

function SmallScheduleCard({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <h3 className="font-black">{title}</h3>

        <button
          type="button"
          className="text-sm font-black text-blue-600"
        >
          Xem tất cả
        </button>
      </div>

      <div className="space-y-1 p-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl p-3 hover:bg-slate-50"
          >
            <div>
              <p className="font-black">{item.title}</p>
              <p className="text-sm font-semibold text-slate-500">
                {item.subtitle}
              </p>
            </div>

            <span
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-black',
                item.status === 'confirmed'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-orange-50 text-orange-700'
              )}
            >
              {statusText(item.status)}
            </span>
          </div>
        ))}

        {items.length === 0 && (
          <p className="p-4 text-center text-sm font-semibold text-slate-400">
            Chưa có lịch.
          </p>
        )}
      </div>
    </div>
  );
}