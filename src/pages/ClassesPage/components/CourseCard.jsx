import { ChevronRight } from "lucide-react";

import CourseProgress from "./CourseProgress";
import { getNextSessionText } from "../classesModel";

export default function CourseCard({ item, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.course.id)}
      aria-label={`Xem chi tiết lớp ${item.title}`}
      aria-haspopup="dialog"
      className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-colors hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-400"
    >
      <div className="mb-3 flex w-full items-center justify-between gap-2">
        <span className="min-w-0 break-words text-lg font-black leading-tight text-brand-700 dark:text-brand-400">
          {item.title}
        </span>

        <ChevronRight
          size={17}
          aria-hidden="true"
          className="shrink-0 text-slate-400"
        />
      </div>

      {item.status === "upcoming" && (
        <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Sắp khai giảng
        </p>
      )}

      <div className="mt-auto w-full">
        <CourseProgress item={item} />

        <p className="mt-2.5 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
          {getNextSessionText(item)}
        </p>
      </div>
    </button>
  );
}
