import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  weekdayLabels,
  nativeWeekdayToMondayIndex,
  addHoursToTime,
  formatDateVN,
} from '../../utils/date';

export default function ClassesPage({
  courses,
  sessions,
  skippedHolidays,
  openAddCourse,
  openEditCourse,
  deleteCourse,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Lớp học của tôi</h2>

        <button
          type="button"
          onClick={openAddCourse}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white"
        >
          <Plus size={18} />
          Thêm lớp
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const courseSessions = sessions.filter(
            (item) => item.courseId === course.id
          );

          const stats = [
            {
              label: 'Đã học',
              value: courseSessions.filter(
                (item) => item.status === 'confirmed'
              ).length,
            },
            {
              label: 'Dự kiến',
              value: courseSessions.filter(
                (item) => item.status === 'planned'
              ).length,
            },
            {
              label: 'Hủy',
              value: courseSessions.filter(
                (item) => item.status === 'cancelled'
              ).length,
            },
            {
              label: 'Nghỉ',
              value: skippedHolidays.filter(
                (item) => item.courseId === course.id
              ).length,
            },
          ];

          return (
            <div
              key={course.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-3xl font-black text-blue-700">
                    {course.code}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {weekdayLabels[nativeWeekdayToMondayIndex(course.weekday)]}
                    {' · '}
                    {course.startTime}
                    {' - '}
                    {addHoursToTime(course.startTime, 2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditCourse(course)}
                    aria-label={`Sửa lớp ${course.code}`}
                    className="rounded-full bg-slate-100 p-2 text-slate-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCourse(course.id)}
                    aria-label={`Xóa lớp ${course.code}`}
                    className="rounded-full bg-red-50 p-2 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Khai giảng: {formatDateVN(course.startDate)}
                {' · Tổng '}
                {course.totalSessions} buổi
              </p>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-slate-50 p-3 text-center"
                  >
                    <p className="text-xl font-black">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">
          Chưa có lớp nào. Thêm lớp để bắt đầu sinh lịch.
        </div>
      )}
    </section>
  );
}