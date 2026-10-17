import { useState } from "react";

import ExtraList from "../../components/ExtraList/ExtraList";
import Field from "../../components/common/Field";
import SelectField from "../../components/common/SelectField";

import { teachingTypes } from "../../utils/extra";

import { mergeCampuses, normalizeCampus } from "../../utils/campuses";

function normalize(value) {
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
  const [type, setType] = useState("");
  const [campus, setCampus] = useState("");
  const [status, setStatus] = useState("");

  const teaching = extras.filter((item) =>
    teachingTypes.some((kind) => kind.value === item.type),
  );

  const campuses = mergeCampuses(
    teaching.map((item) =>
      item.type === "trial" && item.trialMode === "ONL" ? "" : item.campus,
    ),
  );

  const words = normalize(search).split(/\s+/).filter(Boolean);

  const filtered = teaching.filter((item) => {
    const online = item.type === "trial" && item.trialMode === "ONL";

    const text = normalize(
      `${item.classCode || ""} ${
        online ? "Online" : item.campus || ""
      } ${item.note || ""}`,
    );

    const matchCampus =
      !campus ||
      (campus === "__online__"
        ? online
        : !online && normalizeCampus(item.campus) === normalizeCampus(campus));

    return (
      words.every((word) => text.includes(word)) &&
      (!type || item.type === type) &&
      (!status || item.status === status) &&
      matchCampus
    );
  });

  const campusOptions = [
    { value: "", label: "Tất cả cơ sở" },
    { value: "__online__", label: "Online" },

    ...(campus && campus !== "__online__" && !campuses.includes(campus)
      ? [
          {
            value: campus,
            label: `${campus} — không có lịch tháng này`,
          },
        ]
      : []),

    ...campuses.map((name) => ({
      value: name,
      label: name,
    })),
  ];

  const hasFilters = search.trim() || type || campus || status;

  function resetFilters() {
    setSearch("");
    setType("");
    setCampus("");
    setStatus("");
  }

  return (
    <ExtraList
      title="Lịch phát sinh"
      extras={filtered}
      settings={settings}
      openAdd={openAdd}
      onEdit={onEdit}
      updateExtraStatus={updateExtraStatus}
      showHeader={false}
      showType
      emptyMessage={
        hasFilters
          ? "Không tìm thấy lịch phù hợp trong tháng đang chọn."
          : "Chưa có lịch phát sinh trong tháng này."
      }
      filters={
        <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Tìm kiếm"
              value={search}
              onChange={setSearch}
              placeholder="Mã lớp, cơ sở, ghi chú..."
            />

            <SelectField
              label="Loại lịch"
              value={type}
              onChange={setType}
              options={[
                { value: "", label: "Tất cả loại lịch" },
                ...teachingTypes,
              ]}
            />

            <SelectField
              label="Cơ sở"
              value={campus}
              onChange={setCampus}
              options={campusOptions}
            />

            <SelectField
              label="Trạng thái"
              value={status}
              onChange={setStatus}
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "planned", label: "Dự kiến" },
                { value: "confirmed", label: "Đã dạy" },
                { value: "cancelled", label: "Đã hủy" },
                { value: "leave", label: "Nghỉ cá nhân" },
                { value: "covered", label: "Người khác dạy thay" },
              ]}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p
              role="status"
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              Hiển thị {filtered.length}/{teaching.length} lịch trong tháng đang
              chọn.
            </p>

            {Boolean(hasFilters) && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
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
