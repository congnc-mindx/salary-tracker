import useNow from "../../hooks/useNow";
import EmptyState from "../../components/common/EmptyState";
import { useEffect, useMemo, useState } from "react";

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

  const [showCompleted, setShowCompleted] = useState(false);
  useEffect(() => setShowCompleted(false), [selectedMonth]);
  const [selectedId, setSelectedId] = useState(null);
  const now = useNow();

  const items = useMemo(
    () => buildCourseItems(courses, sessions, skippedHolidays, now),
    [courses, sessions, skippedHolidays, now],
  );

  const campuses = useMemo(() => buildCampusOptions(courses), [courses]);

  const scopedItems = useMemo(
    () => scopeCoursesToMonth(items, sessions, selectedMonth),
    [items, sessions, selectedMonth],
  );

  const matchingItems = useMemo(
    () => filterAndSortCourses(scopedItems, filters, true),
    [scopedItems, filters],
  );

  const hiddenCompleted = matchingItems.filter(item => item.status === "completed");
  const visibleItems = showCompleted || filters.status === "completed" ? matchingItems : matchingItems.filter(item => item.status !== "completed");

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
    setShowCompleted(false);
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
      <ClassFilters
        includeCompleted
        filters={filters}
        campuses={campuses}
        count={visibleItems.length}
        total={scopedItems.length}
        sessionsCount={scopedItems.reduce((n, item) => n + item.monthCount, 0)}
        onChange={changeFilter}
        onReset={resetFilters}
      />

      {visibleItems.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
          {!hasFilters
            ? (hiddenCompleted.length ? "Các lớp trong tháng này đã hoàn thành. Nhấn bên dưới để xem lại." : "Không có lớp dạy trong tháng này. Chuyển tháng trên header để tìm lớp.")
            : emptyMessage}
        </EmptyState>
      )}

      {hiddenCompleted.length > 0 && filters.status !== "completed" && <div className="mt-5 text-center">
        <button type="button" aria-expanded={showCompleted} onClick={() => setShowCompleted(value => !value)}
          className="min-h-11 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-brand-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700">
          {showCompleted ? "Ẩn lớp đã hoàn thành" : `Xem thêm ${hiddenCompleted.length} lớp đã hoàn thành trong tháng`}
        </button>
      </div>}
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
