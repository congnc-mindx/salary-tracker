import { Clock, Save, Wallet, X } from 'lucide-react';
import clsx from 'clsx';
import { money } from '../../utils/format';

const colorMap = {
  blue: 'from-blue-500 to-blue-600 shadow-blue-100',
  green: 'from-emerald-400 to-emerald-600 shadow-emerald-100',
  orange: 'from-orange-400 to-orange-500 shadow-orange-100',
  red: 'from-rose-400 to-rose-600 shadow-rose-100',
};

export default function TopCards({
  expectedIncome,
  confirmedIncome,
  waitingIncome,
  cancelledIncome,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<Wallet />}
        title="Thu nhập dự kiến"
        value={money(expectedIncome)}
        desc="Tổng thu nhập tháng"
        color="blue"
      />

      <MetricCard
        icon={<Save />}
        title="Đã xác nhận"
        value={money(confirmedIncome)}
        desc="Đã chắc chắn"
        color="green"
      />

      <MetricCard
        icon={<Clock />}
        title="Chờ xác nhận"
        value={money(waitingIncome)}
        desc="Dự kiến còn lại"
        color="orange"
      />

      <MetricCard
        icon={<X />}
        title="Hủy / Nghỉ"
        value={money(cancelledIncome)}
        desc="Khoản đã bị trừ"
        color="red"
      />
    </div>
  );
}

function MetricCard({ icon, title, value, desc, color }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div
          className={clsx(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg dark:shadow-none',
            colorMap[color]
          )}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950 dark:text-slate-100">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}