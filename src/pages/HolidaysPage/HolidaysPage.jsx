import { Plus, Trash2 } from 'lucide-react';
import { formatDateVN } from '../../utils/date';

export default function HolidaysPage({
  holidays,
  courses,
  openAdd,
  deleteHoliday,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Ngày nghỉ</h2>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white"
        >
          <Plus size={18} />
          Thêm ngày nghỉ
        </button>
      </div>

      <div className="space-y-3">
        {holidays.map((item) => {
          const course = courses.find(
            (course) => course.id === item.applyTo
          );

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-black">{item.title}</p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {formatDateVN(item.startDate)}
                  {' → '}
                  {formatDateVN(item.endDate)}
                  {' · '}
                  {item.applyTo === 'all'
                    ? 'Tất cả lớp'
                    : course?.code || 'Một lớp'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => deleteHoliday(item.id)}
                aria-label={`Xóa ngày nghỉ: ${item.title}`}
                className="shrink-0 rounded-full bg-red-50 p-2 text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}

        {holidays.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">
            Chưa có ngày nghỉ.
          </div>
        )}
      </div>
    </section>
  );
}