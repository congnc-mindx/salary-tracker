import clsx from 'clsx';
import { money, statusText } from '../../utils/format';
import {
  formatDateVN,
  formatDateTimeVN,
} from '../../utils/date';
import { getExtraAmount } from '../../services/income';

export default function SalaryPage({
  sessions,
  extras,
  settings,
  expectedIncome,
  confirmedIncome,
  cancelledIncome,
  teacherBreakdown,
  makeupBreakdown,
  judgeBreakdown,
  trialBreakdown,
}) {
  const breakdowns = [
    { title: 'Lớp học', value: teacherBreakdown },
    { title: 'Dạy bù', value: makeupBreakdown },
    { title: 'Giám khảo', value: judgeBreakdown },
    { title: 'Trial', value: trialBreakdown },
  ];

  return (
    <section>
      <h2 className="mb-4 text-2xl font-black">
        Thống kê thu nhập
      </h2>

      <div className="grid gap-4 lg:grid-cols-4">
        {breakdowns.map((item) => (
          <StatBox
            key={item.title}
            title={item.title}
            value={money(item.value)}
          />
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xl font-black">Tổng hợp</h3>

        <ReportLine
          label="Thu nhập dự kiến"
          value={money(expectedIncome)}
          strong
        />
        <ReportLine
          label="Đã xác nhận"
          value={money(confirmedIncome)}
        />
        <ReportLine
          label="Chờ xác nhận"
          value={money(expectedIncome - confirmedIncome)}
        />
        <ReportLine
          label="Nghỉ / hủy"
          value={money(cancelledIncome)}
          danger
        />
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xl font-black">Chi tiết</h3>

        <div className="space-y-3">
          {sessions.map((item) => (
            <DetailLine
              key={item.key}
              title={`${item.courseCode} · B${item.sessionNo}`}
              subtitle={`${formatDateVN(item.date)} · ${item.startTime}`}
              status={item.status}
              amount={
                item.status === 'cancelled'
                  ? 'Không tính'
                  : money(item.amount)
              }
            />
          ))}

          {extras.map((item) => (
            <DetailLine
              key={item.id}
              title={extraTitle(item)}
              subtitle={extraSubtitle(item)}
              status={item.status}
              amount={money(getExtraAmount(item, settings))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatBox({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-blue-700">
        {value}
      </p>
    </div>
  );
}

function ReportLine({ label, value, strong, danger }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <p className="font-bold text-slate-600">{label}</p>

      <p
        className={clsx(
          'font-black',
          strong && 'text-2xl text-blue-700',
          danger && 'text-red-700'
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DetailLine({ title, subtitle, status, amount }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <div>
        <p className="font-black">{title}</p>
        <p className="text-sm font-semibold text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="text-right">
        <p className="font-black text-blue-700">{amount}</p>
        <p className="text-xs font-bold text-slate-400">
          {statusText(status)}
        </p>
      </div>
    </div>
  );
}

function extraTitle(item) {
  if (item.type === 'makeup') {
    return `Dạy bù · ${item.classCode}`;
  }

  if (item.type === 'judge') {
    return `Giám khảo · ${item.classCode}`;
  }

  return `Trial ${item.trialMode} · ${item.studentCount || 0} HS`;
}

function extraSubtitle(item) {
  const datetime = formatDateTimeVN(item.datetime);
  const note = item.note ? ` · ${item.note}` : '';

  if (item.type === 'trial') {
    return `${datetime} · ${item.campus || 'Chưa có cơ sở'}${note}`;
  }

  if (item.type === 'makeup') {
    return `${datetime} · ${item.hours || 0} giờ${note}`;
  }

  return datetime;
}