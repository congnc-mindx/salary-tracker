import Field from "../../../components/common/Field";
import SelectField from "../../../components/common/SelectField";

import { normalizeSearch } from "../../../utils/courseDisplay";
import { hasActiveFilters } from "../classesModel";

const statusOptions = [
  { value: "all", label: "Tất cả các lớp" },
  { value: "upcoming", label: "Sắp khai giảng" },
  { value: "checkpoint", label: "Sắp tới buổi 5, 9, 14" },
  { value: "completed", label: "Đã hoàn thành" },
];

const milestoneOptions = [
  { value: "all", label: "Tất cả buổi" },
  { value: "5", label: "Buổi 5" },
  { value: "9", label: "Buổi 9" },
  { value: "14", label: "Buổi 14" },
];

export default function ClassFilters({
  filters,
  campuses,
  count,
  onChange,
  onReset,
}) {
  const hidingCompleted =
    filters.status === "all" && !normalizeSearch(filters.search);

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field
          label="Tìm kiếm"
          type="search"
          value={filters.search}
          onChange={(value) => onChange("search", value)}
          placeholder="Mã lớp, cơ sở..."
        />

        <SelectField
          label="Trạng thái"
          value={filters.status}
          onChange={(value) => onChange("status", value)}
          options={statusOptions}
        />

        <SelectField
          label="Cơ sở"
          value={filters.campus}
          onChange={(value) => onChange("campus", value)}
          options={[{ value: "all", label: "Tất cả cơ sở" }, ...campuses]}
        />

        <SelectField
          label="Buổi tiếp theo"
          value={filters.milestone}
          onChange={(value) => onChange("milestone", value)}
          disabled={filters.status === "completed"}
          options={milestoneOptions}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
          Hiển thị {count} lớp
          {hidingCompleted ? " · Đang ẩn lớp đã hoàn thành" : ""}
        </p>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
