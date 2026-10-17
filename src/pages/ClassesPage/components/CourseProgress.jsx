import { getProgressColor } from "../classesModel";

export default function CourseProgress({ item }) {
  const percent = Math.min(
    100,
    Math.max(0, (item.completedCount / item.total) * 100),
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400">
          Đã học
        </span>

        <span className="font-bold tabular-nums text-slate-700 dark:text-slate-200">
          {item.completedCount}/{item.total} buổi
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`Tiến độ lớp ${item.title}`}
        aria-valuemin={0}
        aria-valuemax={item.total}
        aria-valuenow={Math.min(item.completedCount, item.total)}
        className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      >
        <div
          className={`h-full rounded-full ${getProgressColor(item.group)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
