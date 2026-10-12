import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { money, statusText } from '../../utils/format';
import { getExtraAmount } from '../../services/income';
import { formatDateTimeVN, addHoursToTime, timeFromDateTime } from '../../utils/date';

export default function ExtraList({
  title,
  type,
  extras,
  settings,
  openAdd,
  updateExtraStatus,
  filters = null,
  emptyMessage,
}) {
  const filtered = extras.filter((item) => item.type === type);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{title}</h2>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white"
        >
          <Plus size={18} />
          Book lịch
        </button>
      </div>

      {filters}

      <div className="space-y-3">
        {filtered.map((item) => {
          const isCancelled = item.status === 'cancelled';

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-black">
                    {type === 'makeup' ? 'Dạy bù' : 'Giám khảo'}
                    {' · '}
                    {item.classCode}
                  </p>

                  {item.campus && (
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {item.campus}
                    </p>
                  )}

                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {formatDateTimeVN(item.datetime)}

                    {type === 'judge' && (
                      <>
                        {' – '}
                        {addHoursToTime(timeFromDateTime(item.datetime), 2)}
                        {timeFromDateTime(item.datetime) >= '22:00'
                          ? ' ngày kế tiếp'
                          : ''}
                        {' · '}2 tiếng
                      </>
                    )}

                    {type === 'makeup' ? ` · ${item.hours || 0} giờ` : ''}
                  </p>

                  {item.note && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.note}
                    </p>
                  )}

                  <p className="mt-2 font-black text-blue-700 dark:text-blue-400">
                    {isCancelled
                      ? 'Không tính'
                      : money(getExtraAmount(item, settings))}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={clsx(
                      'rounded-full px-4 py-2 text-sm font-black',
                      item.status === 'confirmed' &&
                      'bg-blue-600 text-white',
                      item.status === 'planned' &&
                      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
                      isCancelled &&
                      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    )}
                  >
                    {statusText(item.status)}
                  </span>

                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() =>
                        updateExtraStatus(item.id, 'cancelled')
                      }
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500 hover:bg-red-50 hover:text-red-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {emptyMessage || `Chưa có lịch ${title.toLowerCase()}.`}
          </div>
        )}
      </div>
    </section>
  );
}