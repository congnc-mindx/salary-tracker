import { useSubjectCatalog } from "../../ReviewsPage/SubjectCatalogContext";
import { subjectLabel } from "../../ReviewsPage/subjectCatalog";
import { resolveCourseSubject } from "../../ReviewsPage/reviewsModel";
import { useState } from "react";
import { todayISO } from "../../../utils/date";
import { isFinalReviewAvailable } from "../../ReviewsPage/reviewsModel";
import FinalReviewEditor from "../../ReviewsPage/components/FinalReviewEditor";
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
  sessions = [],
  templates = {},
  onSaveCourse,
}) {
  const catalog = useSubjectCatalog();
  const course = { ...item.course, subject: resolveCourseSubject(item.course, catalog) };
  const [reviewOpen, setReviewOpen] = useState(false);
  if (reviewOpen)
    return (
      <FinalReviewEditor
        title={`Cuối khóa · ${item.title}`}
        initialValue={course.finalReview || templates[course.subject]}
        template={templates[course.subject]}
        onClose={() => setReviewOpen(false)}
        onSave={(value) =>
          onSaveCourse(
            {
              finalReview: {
                ...value,
                subject: course.subject || "",
                savedAt: Date.now(),
              },
            },
            course.id,
          )
        }
      />
    );

  return (
    <ModalShell
      title={item.title}
      description={STATUS_LABELS[item.status]}
      onClose={onClose}
    >
      <dl className="divide-y divide-slate-200 dark:divide-slate-800">
        <DetailRow label="Học phần">{subjectLabel(course.subject, catalog) || "Chưa chọn"}</DetailRow>
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

      {isFinalReviewAvailable(course, sessions, todayISO()) && (
        <button
          type="button"
          onClick={() => setReviewOpen(true)}
          className="mt-5 w-full rounded-2xl bg-brand-50 p-4 text-sm font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200"
        >
          Mở nhận xét cuối khóa
        </button>
      )}
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
