import { useState } from "react";
import StatPanel from "./StatPanel";
import ModalShell from "../../../components/common/ModalShell";
import { money } from "../../../utils/format";
import { formatDateVN } from "../../../utils/date";
import { WORK_TYPES } from "../statisticsModel";
export default function IncomeDetails({ stats }) {
  const [search, setSearch] = useState(""),
    [sort, setSort] = useState("total"),
    [selected, setSelected] = useState(null);
  const visible = stats.groups
    .filter((item) =>
      (item.title + " " + item.campus)
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title, "vi")
        : b[sort] - a[sort],
    );
  const current = stats.groups.find((item) => item.key === selected);
  return (
    <StatPanel
      title="Chi tiết đóng góp"
      description="Chọn một dòng để đối chiếu từng lịch • Tổng cuối bảng là toàn tháng"
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          aria-label="Tìm trong thống kê"
          placeholder="Tìm lớp, công việc, cơ sở…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-transparent p-3 text-sm dark:border-slate-700"
        />
        <select
          aria-label="Sắp xếp thống kê"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="total">Thu nhập cao nhất</option>
          <option value="hours">Số giờ nhiều nhất</option>
          <option value="name">Tên A–Z</option>
        </select>
      </div>
      {!visible.length && (
        <p className="py-8 text-center text-sm text-slate-500">
          Không có dữ liệu phù hợp.
        </p>
      )}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <tr>
              {[
                "Lớp / Công việc",
                "Cơ sở",
                "Lịch / Giờ",
                "Đã ghi nhận",
                "Còn dự kiến",
                "Tổng",
              ].map((title) => (
                <th key={title} className="px-2 py-3">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr
                key={item.key}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => setSelected(item.key)}
                    className="py-2 text-left font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300"
                  >
                    {item.title}
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      {WORK_TYPES.find((type) => type.key === item.type)?.label}
                    </span>
                  </button>
                </td>
                <td className="p-2">{item.campus}</td>
                <td className="whitespace-nowrap p-2">
                  {item.count} / {item.hours.toLocaleString("vi-VN")}
                </td>
                {[item.confirmed, item.waiting, item.total].map(
                  (value, index) => (
                    <td
                      key={index}
                      className={
                        "whitespace-nowrap p-2 tabular-nums " +
                        (index === 2 ? "font-bold" : "")
                      }
                    >
                      {money(value)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="px-2 pt-4" colSpan={3}>
                Toàn tháng · {stats.count} lịch /{" "}
                {stats.hours.toLocaleString("vi-VN")} giờ
              </td>
              {[stats.confirmed, stats.waiting, stats.total].map(
                (value, index) => (
                  <td
                    key={index}
                    className="whitespace-nowrap px-2 pt-4 tabular-nums"
                  >
                    {money(value)}
                  </td>
                ),
              )}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="space-y-2 md:hidden">
        {visible.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSelected(item.key)}
            className="flex w-full items-start justify-between gap-3 rounded-xl bg-slate-50 p-3 text-left dark:bg-slate-800"
          >
            <div className="min-w-0">
              <strong className="block break-words">{item.title}</strong>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                {item.campus} · {item.count} lịch · {item.hours} giờ
              </span>
            </div>
            <strong className="shrink-0 text-sm tabular-nums">
              {money(item.total)}
            </strong>
          </button>
        ))}
        <p className="pt-3 text-sm font-bold">
          Toàn tháng: {money(stats.total)}
        </p>
      </div>
      {current && (
        <ModalShell
          title={current.title}
          description={
            current.campus +
            " · " +
            current.count +
            " lịch · " +
            money(current.total)
          }
          onClose={() => setSelected(null)}
        >
          <div className="space-y-3">
            {[...current.rows]
              .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
              .map((row) => (
                <article
                  key={row.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>
                      {formatDateVN(row.date)} · {row.time}
                    </strong>
                    <strong>{money(row.amount)}</strong>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {row.sessionNo ? "Buổi " + row.sessionNo + " · " : ""}
                    {row.hours} giờ ·{" "}
                    {row.status === "confirmed" ? "Đã ghi nhận" : "Còn dự kiến"}
                  </p>
                </article>
              ))}
          </div>
        </ModalShell>
      )}
    </StatPanel>
  );
}
