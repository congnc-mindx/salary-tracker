import clsx from 'clsx';

import { weekdayLabels, todayISO, formatDateVN, dateFromDateTime, timeFromDateTime, getMondayIndex, getDaysInMonth } from '../../utils/date';
import { money, statusText } from '../../utils/format';
import { extraTitle, extraSubtitle } from '../../utils/extra';
import { isPaidStatus, getExtraAmount } from '../../services/income';

const eventStyles = {
  class: 'bg-emerald-50 text-emerald-800',
  makeup: 'bg-blue-50 text-blue-800',
  judge: 'bg-purple-50 text-purple-800',
  trial: 'bg-orange-50 text-orange-800',
  holiday: 'bg-rose-50 text-rose-800',
};

const legends = [
  { color: 'bg-emerald-500', label: 'Lớp học' },
  { color: 'bg-blue-500', label: 'Dạy bù' },
  { color: 'bg-purple-500', label: 'Giám khảo' },
  { color: 'bg-orange-500', label: 'Trial' },
  { color: 'bg-rose-500', label: 'Ngày nghỉ' },
];

export default function CalendarBoard({
  selectedMonth,
  sessions,
  skippedHolidays,
  extras,
  settings,
  updateSessionStatus,
  updateExtraStatus,
}) {
  const days = getDaysInMonth(selectedMonth);
  const blankCount = getMondayIndex(days[0]);
  const today = todayISO();

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="p-5 text-center font-black text-slate-700"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: blankCount }, (_, index) => (
            <div
              key={`blank-${index}`}
              className="min-h-[118px] border-b border-r border-slate-100 bg-slate-50"
            />
          ))}

          {days.map((date) => {
            const daySessions = sessions.filter(
              (item) => item.date === date
            );
            const daySkipped = skippedHolidays.filter(
              (item) => item.date === date
            );
            const dayExtras = extras.filter(
              (item) => dateFromDateTime(item.datetime) === date
            );
            const isToday = date === today;

            return (
              <div
                key={date}
                className={clsx(
                  'min-h-[118px] border-b border-r border-slate-100 p-3',
                  daySkipped.length > 0
                    ? 'bg-rose-50'
                    : isToday
                      ? 'bg-blue-50'
                      : 'bg-white'
                )}
              >
                <div
                  className={clsx(
                    'mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black',
                    isToday
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700'
                  )}
                >
                  {Number(date.slice(-2))}
                </div>

                <div className="space-y-1.5">
                  {daySessions.slice(0, 3).map((item) => (
                    <CalendarPill
                      key={item.key}
                      text={`${item.courseCode} · B${item.sessionNo}`}
                      sub={item.startTime}
                      status={item.status}
                      kind="class"
                    />
                  ))}

                  {daySkipped.slice(0, 1).map((item) => (
                    <CalendarPill
                      key={item.id}
                      text={item.title}
                      status="cancelled"
                      kind="holiday"
                    />
                  ))}

                  {dayExtras.slice(0, 3).map((item) => (
                    <CalendarPill
                      key={item.id}
                      text={extraTitle(item)}
                      sub={timeFromDateTime(item.datetime)}
                      status={item.status}
                      kind={item.type}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-5 text-sm font-bold text-slate-500">
        {legends.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={clsx('h-3 w-3 rounded-full', item.color)} />
            {item.label}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xl font-black">
            Buổi học trong tháng
          </h3>

          <div className="space-y-3">
            {sessions.map((item) => (
              <WorkRow
                key={item.key}
                title={`${item.courseCode} · Buổi ${item.sessionNo}`}
                subtitle={`${formatDateVN(item.date)} · ${item.startTime} - ${item.endTime}`}
                amount={
                  isPaidStatus(item.status)
                    ? money(item.amount)
                    : 'Không tính'
                }
                status={item.status}
                onStatus={(status) =>
                  updateSessionStatus(item.key, status)
                }
              />
            ))}

            {sessions.length === 0 && (
              <Empty text="Tháng này chưa có buổi học nào." />
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xl font-black">
            Lịch phụ trong tháng
          </h3>

          <div className="space-y-3">
            {extras.map((item) => (
              <WorkRow
                key={item.id}
                title={extraTitle(item)}
                subtitle={extraSubtitle(item)}
                amount={money(getExtraAmount(item, settings))}
                status={item.status}
                onStatus={(status) =>
                  updateExtraStatus(item.id, status)
                }
              />
            ))}

            {extras.length === 0 && (
              <Empty text="Chưa có dạy bù, giám khảo hoặc trial." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarPill({ text, sub, status, kind }) {
  return (
    <div
      className={clsx(
        'rounded-xl px-2.5 py-2 text-xs font-black',
        status === 'cancelled'
          ? 'bg-rose-100 text-rose-800'
          : eventStyles[kind]
      )}
    >
      <div className="truncate">{text}</div>
      {sub && <div className="mt-0.5 font-bold opacity-80">{sub}</div>}
    </div>
  );
}

function WorkRow({ title, subtitle, amount, status, onStatus }) {
  const isCancelled = status === 'cancelled';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-black">{title}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {subtitle}
          </p>
          <p className="mt-2 font-black text-blue-700">
            {isCancelled ? 'Không tính' : amount}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-black',
              status === 'confirmed' && 'bg-blue-600 text-white',
              status === 'planned' && 'bg-slate-100 text-slate-500',
              isCancelled && 'bg-red-100 text-red-700'
            )}
          >
            {statusText(status)}
          </span>

          {!isCancelled && (
            <button
              type="button"
              onClick={() => onStatus('cancelled')}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500 hover:bg-red-50 hover:text-red-700"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">
      {text}
    </div>
  );
}