import { useEffect, useMemo, useState } from "react";

import ClassFilters from "./components/ClassFilters";
import CourseCard from "./components/CourseCard";
import CourseDetailsModal from "./components/CourseDetailsModal";

import {
  DEFAULT_FILTERS,
  buildCourseItems,
  buildCampusOptions,
  filterAndSortCourses,
  hasActiveFilters,
} from "./classesModel";

const EMPTY_LIST = [];

export default function ClassesPage({
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
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    function refresh() {
      setNow(Date.now());
    }

    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const items = useMemo(
    () => buildCourseItems(courses, sessions, skippedHolidays, now),
    [courses, sessions, skippedHolidays, now],
  );

  const campuses = useMemo(() => buildCampusOptions(courses), [courses]);

  const visibleItems = useMemo(
    () => filterAndSortCourses(items, filters),
    [items, filters],
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
      <ClassFilters
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
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {emptyMessage}
        </div>
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
