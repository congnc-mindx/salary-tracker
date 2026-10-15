import { useState } from "react";

import ExtraList from "../../components/ExtraList/ExtraList";
import Field from "../../components/common/Field";
import SelectField from "../../components/common/SelectField";

import { mergeCampuses, normalizeCampus } from "../../utils/campuses";

function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

export default function MakeupPage({
  extras,
  settings,
  openAdd,
  onEdit,
  updateExtraStatus,
}) {
  const [search, setSearch] = useState("");
  const [campusFilter, setCampusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const makeupExtras = extras.filter((item) => item.type === "makeup");

  const campuses = mergeCampuses(makeupExtras.map((item) => item.campus));

  const keywords = normalizeSearch(search).split(/\s+/).filter(Boolean);

  const filteredExtras = makeupExtras
    .filter((item) => {
      const searchableText = normalizeSearch(
        `${item.classCode ?? ""} ${item.campus ?? ""} ${item.note ?? ""}`,
      );

      const matchSearch = keywords.every((keyword) =>
        searchableText.includes(keyword),
      );

      const matchCampus =
        !campusFilter ||
        normalizeCampus(item.campus) === normalizeCampus(campusFilter);

      const matchStatus = !statusFilter || item.status === statusFilter;

      return matchSearch && matchCampus && matchStatus;
    })
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  const hasFilters =
    Boolean(search.trim()) || Boolean(campusFilter) || Boolean(statusFilter);

  const campusOptions = [
    {
      value: "",
      label: "Tất cả cơ sở",
    },

    // Giữ lựa chọn khi chuyển sang tháng không có cơ sở đó.
    ...(campusFilter && !campuses.includes(campusFilter)
      ? [
          {
            value: campusFilter,
            label: `${campusFilter} — không có lịch tháng này`,
          },
        ]
      : []),

    ...campuses.map((name) => ({
      value: name,
      label: name,
    })),
  ];

  function resetFilters() {
    setSearch("");
    setCampusFilter("");
    setStatusFilter("");
  }

  return (
    <ExtraList
      title="Dạy bù"
      type="makeup"
      extras={filteredExtras}
      settings={settings}
      openAdd={openAdd}
      onEdit={onEdit}
      updateExtraStatus={updateExtraStatus}
      emptyMessage={
        hasFilters
          ? "Không tìm thấy lịch phù hợp trong tháng đang chọn."
          : "Chưa có lịch dạy bù trong tháng này."
      }
      filters={
        <div
          className="
            mb-4 rounded-3xl border border-slate-200
            bg-white p-4
            dark:border-slate-700 dark:bg-slate-900
          "
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Field
              label="Tìm kiếm"
              value={search}
              onChange={setSearch}
              placeholder="Nhập mã lớp, cơ sở hoặc ghi chú..."
            />

            <SelectField
              label="Cơ sở"
              value={campusFilter}
              onChange={setCampusFilter}
              options={campusOptions}
            />

            <SelectField
              label="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                {
                  value: "",
                  label: "Tất cả trạng thái",
                },
                {
                  value: "planned",
                  label: "Dự kiến",
                },
                {
                  value: "confirmed",
                  label: "Đã dạy",
                },
                {
                  value: "cancelled",
                  label: "Đã hủy",
                },
              ]}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p
              role="status"
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              Hiển thị {filteredExtras.length}/{makeupExtras.length} lịch trong
              tháng đang chọn.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="
                  rounded-xl bg-slate-100 px-3 py-2
                  text-sm font-bold text-slate-600
                  hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300
                  dark:hover:bg-slate-700
                "
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      }
    />
  );
}
