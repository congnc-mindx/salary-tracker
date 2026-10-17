import { Pencil, Trash2 } from "lucide-react";

import ModalShell from "../../../components/common/ModalShell";
import CourseProgress from "./CourseProgress";

import {
  weekdayLabels,
  nativeWeekdayToMondayIndex,
  addHoursToTime,
  formatDateVN,
} from "../../../utils/date";

import { getNextSessionText, STATUS_LABELS } from "../classesModel";

export default function CourseDetailsModal({
  item,
  onClose,
  onEdit,
  onDelete,
}) {
  const { course } = item;

  return (
    <ModalShell
      title={item.title}
      description={STATUS_LABELS[item.status]}
      onClose={onClose}
    >
      <dl className="divide-y divide-slate-200 dark:divide-slate-800">
        <DetailRow label="Mã lớp">{course.code}</DetailRow>

        <DetailRow label="Cơ sở">{course.campus || "Chưa cập nhật"}</DetailRow>

        <DetailRow label="Khai giảng">
          {formatDateVN(course.startDate)}
        </DetailRow>

        <DetailRow label="Lịch cố định">
          {weekdayLabels[nativeWeekdayToMondayIndex(course.weekday)]}
          {" · "}
          {course.startTime}
          {" – "}
          {addHoursToTime(course.startTime, 2)}
        </DetailRow>

        <DetailRow label="Buổi tiếp theo">{getNextSessionText(item)}</DetailRow>

        {item.holidayCount > 0 && (
          <DetailRow label="Lịch nghỉ">
            {item.holidayCount} lượt nghỉ theo lịch
          </DetailRow>
        )}
      </dl>

      <div className="mt-5">
        <CourseProgress item={item} />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => onDelete(course.id)}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
        >
          <Trash2 size={17} />
          Xóa lớp
        </button>

        <button
          type="button"
          onClick={() => onEdit(course)}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <Pencil size={17} />
          Sửa lớp
        </button>
      </div>
    </ModalShell>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-3 text-sm">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>

      <dd className="break-words text-right font-semibold text-slate-900 dark:text-slate-100">
        {children}
      </dd>
    </div>
  );
}
