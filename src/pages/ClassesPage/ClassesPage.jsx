import useNow from "../../hooks/useNow";
import EmptyState from "../../components/common/EmptyState";
import { useMemo, useState } from "react";

import ClassFilters from "./components/ClassFilters";
import CourseCard from "./components/CourseCard";
import CourseDetailsModal from "./components/CourseDetailsModal";

import {
  scopeCoursesToMonth,
  DEFAULT_FILTERS,
  buildCourseItems,
  buildCampusOptions,
  filterAndSortCourses,
  hasActiveFilters,
} from "./classesModel";

const EMPTY_LIST = [];

export default function ClassesPage({
  selectedMonth,
  courses = EMPTY_LIST,
  sessions = EMPTY_LIST,
  skippedHolidays = EMPTY_LIST,
  openEditCourse,
  deleteCourse,
  templates,
  onSaveCourse,
}) {
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
  }));

  const [scope, setScope] = useState("month");
  const [selectedId, setSelectedId] = useState(null);
  const now = useNow();

  const items = useMemo(
    () => buildCourseItems(courses, sessions, skippedHolidays, now),
    [courses, sessions, skippedHolidays, now],
  );

  const campuses = useMemo(() => buildCampusOptions(courses), [courses]);

  const scopedItems = useMemo(
    () =>
      scope === "month"
        ? scopeCoursesToMonth(items, sessions, selectedMonth)
        : items,
    [items, sessions, selectedMonth, scope],
  );

  const visibleItems = useMemo(
    () => filterAndSortCourses(scopedItems, filters, scope === "month"),
    [scopedItems, filters, scope],
  );

  const selectedItem = items.find((item) => item.course.id === selectedId);

  const hasFilters = hasActiveFilters(filters);

  function changeFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "status" ? { milestone: "all" } : {}),
    }));
  }

  function resetFilters() {
    setFilters({ ...DEFAULT_FILTERS });
  }

  function closeDetails() {
    setSelectedId(null);
  }

  function editCourse(course) {
    closeDetails();
    openEditCourse(course);
  }

  const emptyMessage =
    courses.length === 0
      ? "Chưa có lớp nào. Thêm lớp để bắt đầu."
      : hasFilters
        ? "Không tìm thấy lớp phù hợp với bộ lọc."
        : "Không có lớp đang triển khai. Chọn “Đã hoàn thành” để xem các lớp cũ.";

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            ["month", "Theo tháng"],
            ["all", "Tất cả thời gian"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={scope === value}
              onClick={() => setScope(value)}
              className={`min-h-11 rounded-lg px-4 text-sm font-bold ${scope === value ? "bg-brand-600 text-white" : "text-slate-600 dark:text-slate-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {scope === "month"
            ? `${selectedMonth.slice(5)}/${selectedMonth.slice(0, 4)} · ${scopedItems.length} lớp · ${scopedItems.reduce((n, item) => n + item.monthCount, 0)} buổi dạy`
            : "Đang xem toàn bộ thời gian"}
        </p>
      </div>
      {scope === "month" && (
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Gồm lớp có buổi dạy trong tháng, kể cả lớp hiện đã hoàn thành. Không
          tính buổi nghỉ, hủy hoặc người khác dạy thay. Tiến độ bên dưới là tiến
          độ hiện tại.
        </p>
      )}

      <ClassFilters
        includeCompleted={scope === "month"}
        filters={filters}
        campuses={campuses}
        count={visibleItems.length}
        onChange={changeFilter}
        onReset={resetFilters}
      />

      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
          {visibleItems.map((item) => (
            <CourseCard
              key={item.course.id}
              item={item}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      ) : (
        <EmptyState>
          {scope === "month" && !hasFilters
            ? "Không có lớp dạy trong tháng này. Chuyển tháng hoặc chọn Tất cả thời gian để tìm lớp."
            : emptyMessage}
        </EmptyState>
      )}

      {selectedItem && (
        <CourseDetailsModal
          item={selectedItem}
          onClose={closeDetails}
          onEdit={editCourse}
          onDelete={deleteCourse}
          sessions={sessions}
          templates={templates}
          onSaveCourse={onSaveCourse}
        />
      )}
    </section>
  );
}
