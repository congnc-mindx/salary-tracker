import { importScope } from "./importScope";
import SharedSelect from "../../../components/common/SharedSelect";
import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import Button from "../../../components/common/Button";
import { canonicalClass, defaultCampus, TYPES } from "./model";
import { getCourseTitle, getCampusCode, getPayrollCampusAliases } from "../../../utils/courseDisplay";
import { money } from "../../../utils/format";
const select =
  "mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950";
export default function ImportPreview({
  busy = false,
  error = "",
  parsed,
  selectedMonth,
  knownAliases,
  courses,
  expected,
  configuredCampuses = [],
  onClose,
  onAnalyze,
}) {
  const month = selectedMonth;
  const teacher = parsed.teachers.length === 1 ? parsed.teachers[0] : "";
  const complete = true;
  const [aliases, setAliases] = useState(() => ({
      campuses: { ...knownAliases.campuses, ...Object.fromEntries(parsed.rows.map(r => { const map = getPayrollCampusAliases([...configuredCampuses, ...courses.map(c=>c.campus)]); return [r.centre, map[r.centre.toUpperCase()] || knownAliases.campuses?.[r.centre] || defaultCampus(r.centre)]; })) },
      classes: { ...knownAliases.classes },
      types: { ...knownAliases.types },
    }));
  const { scope, picked } = importScope(parsed.rows, teacher);
  const campuses = [
    ...new Set([
      ...courses.map((c) => getCampusCode(c.campus)),
      ...expected.map((e) => e.campus),
    ]),
  ].filter(Boolean);
  const classNames = [
    ...new Set([
      ...courses.map(getCourseTitle),
      ...expected.map((e) => e.classKey),
    ]),
  ]
    .filter(Boolean)
    .sort();
  function change(group, key, value) {
    setAliases((a) => ({ ...a, [group]: { ...a[group], [key]: value } }));
  }
  return (
    <ModalShell
      title={`Đối soát · T${Number(month.slice(5))}/${month.slice(0,4)}`}
      busy={busy}
      wide
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {picked.length} dòng ·{" "}
            {money(picked.reduce((n, r) => n + r.total, 0))}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" disabled={busy || !teacher || !picked.length || parsed.errors.length > 0} onClick={()=>onAnalyze({month,teacher,scope,rows:picked,aliases,complete})}>
              {busy ? "Đang lưu…" : "Lưu và đối soát"}
            </Button>
            <Button variant="reviewSave" disabled={busy || !complete || !teacher || !picked.length || parsed.errors.length > 0} onClick={()=>onAnalyze({month,teacher,scope,rows:picked,aliases,complete,salaryOnly:true})}>
              Cập nhật lương
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {parsed.teachers.length > 1 && <p role="alert" className="text-sm text-red-500">Bảng chứa nhiều giáo viên. Hãy dán riêng bảng của bạn.</p>}
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {parsed.errors.length > 0 && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            <p className="font-bold">
              Có {parsed.errors.length} dòng lỗi. Chưa thể đối chiếu để tránh bỏ
              sót lương.
            </p>
            <ul className="mt-2 list-inside list-disc">
              {parsed.errors.slice(0, 8).map((e) => (
                <li key={e.line}>
                  Dòng {e.line}: {e.message}
                </li>
              ))}
            </ul>
            <p>Kiểm tra các dòng trên trong bảng nguồn rồi dán lại.</p>
          </div>
        )}
        <section className="space-y-4">
          <h4 className="font-bold">
            Kiểm tra mã cơ sở và lớp
          </h4>
          <p className="my-2 text-xs text-slate-500 dark:text-slate-400">
            Dùng mã cơ sở đã thiết lập trong Cài đặt → Thu nhập. Tự bỏ nhãn C4K/ROB, giữ hậu tố HB. Thay đổi tại đây chỉ áp dụng quy tắc đối soát.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {scope.map((c) => (
              <label key={c} className="text-sm">
                Cơ sở {c}
                <SharedSelect
                  className={select}
                  value={aliases.campuses[c] || defaultCampus(c)}
                  onChange={(e) => change("campuses", c, e.target.value)}
                >
                  {[...new Set([defaultCampus(c), ...campuses])].map((v) => (
                    <option key={v} value={v}>
                      {v}
                      {!campuses.includes(v) ? " — chưa có lịch trên web" : ""}
                    </option>
                  ))}
                </SharedSelect>
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[...new Set(picked.map((r) => r.rawClass))].map((c) => (
              <label key={c} className="min-w-0 break-words text-sm">
                {c}
                <SharedSelect
                  className={select}
                  value={aliases.classes[c] || ""}
                  onChange={(e) => change("classes", c, e.target.value)}
                >
                  <option value="">Tự chuẩn hóa: {canonicalClass(c)}</option>
                  {classNames.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </SharedSelect>
              </label>
            ))}
          </div>
        </section>
        {[
          ...new Set(
            picked
              .filter((r) => r.type === "unknown")
              .map((r) => `${r.rawType}|${r.role}`),
          ),
        ].map((k) => (
          <label key={k} className="block text-sm font-bold">
            Phân loại {k}
            <SharedSelect
              className={select}
              value={aliases.types[k] || "unknown"}
              onChange={(e) => change("types", k, e.target.value)}
            >
              {Object.entries(TYPES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </SharedSelect>
          </label>
        ))}
        {picked.some(r => !r.date.startsWith(month)) && <p className="text-sm text-amber-700 dark:text-amber-300">Có {picked.filter(r => !r.date.startsWith(month)).length} ca dạy ngoài tháng này, vẫn được tính trong bảng lương đã nhập.</p>}
        {parsed.ignored > 0 && <p className="text-xs text-slate-500">Đã bỏ qua {parsed.ignored} dòng ngoài bảng hoặc tiêu đề lặp.</p>}
      </div>
    </ModalShell>
  );
}
