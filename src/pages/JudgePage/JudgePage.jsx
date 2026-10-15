import { useState } from "react";
import { ChevronDown } from "lucide-react";

import ExtraList from "../../components/ExtraList/ExtraList";
import { mergeCampuses, normalizeCampus } from "../../utils/campuses";

export default function JudgePage({
  extras,
  settings,
  openAdd,
  updateExtraStatus,
}) {
  const [campusFilter, setCampusFilter] = useState("all");

  const judgeExtras = extras.filter((item) => item.type === "judge");

  const campuses = mergeCampuses(judgeExtras.map((item) => item.campus));

  const filteredExtras = judgeExtras.filter(
    (item) =>
      campusFilter === "all" || normalizeCampus(item.campus) === campusFilter,
  );

  return (
    <ExtraList
      title="Ban giám khảo"
      type="judge"
      extras={filteredExtras}
      settings={settings}
      openAdd={openAdd}
      updateExtraStatus={updateExtraStatus}
      emptyMessage={
        campusFilter === "all"
          ? "Chưa có lịch giám khảo trong tháng này."
          : "Không có lịch giám khảo tại cơ sở này trong tháng đang chọn."
      }
      filters={
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <label className="block sm:max-w-xs">
            <span className="mb-2 block text-sm font-bold">Cơ sở</span>

            <div className="relative">
              <select
                value={campusFilter}
                onChange={(event) => setCampusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">Tất cả cơ sở</option>

                {campusFilter !== "all" &&
                  !campuses.some(
                    (name) => normalizeCampus(name) === campusFilter,
                  ) && (
                    <option value={campusFilter}>
                      Cơ sở đã chọn — không có lịch tháng này
                    </option>
                  )}

                {campuses.map((name) => (
                  <option key={name} value={normalizeCampus(name)}>
                    {name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </label>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Hiển thị {filteredExtras.length} lịch giám khảo
          </p>
        </div>
      }
    />
  );
}
