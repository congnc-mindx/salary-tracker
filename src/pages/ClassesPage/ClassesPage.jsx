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

  const visibleItems = useMemo(
    () => filterAndSortCourses(scopedItems, filters, true),
    [scopedItems, filters],
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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {`${selectedMonth.slice(5)}/${selectedMonth.slice(0, 4)} · ${scopedItems.length} lớp · ${scopedItems.reduce((n, item) => n + item.monthCount, 0)} buổi dạy`}
        </p>
      </div>
      {
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Gồm lớp có buổi dạy trong tháng, kể cả lớp hiện đã hoàn thành. Không
          tính buổi nghỉ, hủy hoặc người khác dạy thay. Tiến độ bên dưới là tiến
          độ hiện tại.
        </p>
      }

      <ClassFilters
        includeCompleted
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
          {!hasFilters
            ? "Không có lớp dạy trong tháng này. Chuyển tháng trên header để tìm lớp."
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
