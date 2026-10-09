import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { money, statusText } from '../../utils/format';
import { formatDateTimeVN } from '../../utils/date';
import { getExtraAmount } from '../../services/income';

export default function TrialsPage({
  extras,
  settings,
  openAdd,
  updateExtraStatus,
}) {
  const trials = extras.filter((item) => item.type === 'trial');

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Dạy trải nghiệm</h2>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white"
        >
          <Plus size={18} />
          Book lịch
        </button>
      </div>

      <div className="space-y-3">
        {trials.map((item) => {
          const isCancelled = item.status === 'cancelled';

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-black">
                    Trial {item.trialMode} · {item.studentCount || 0} HS
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {formatDateTimeVN(item.datetime)}
                    {' · '}
                    {item.campus || 'Chưa có cơ sở'}
                    {item.note ? ` · ${item.note}` : ''}
                  </p>

                  <p className="mt-2 font-black text-blue-700">
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
                        'bg-slate-100 text-slate-500',
                      isCancelled && 'bg-red-100 text-red-700'
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
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500 hover:bg-red-50 hover:text-red-700"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {trials.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">
            Chưa có lịch dạy trải nghiệm.
          </div>
        )}
      </div>
    </section>
  );
}