import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import Button from "../../../components/common/Button";
import { canonicalClass, defaultCampus, TYPES } from "./model";
import { getCourseTitle, getCampusCode } from "../../../utils/courseDisplay";
import { money } from "../../../utils/format";
const select =
  "mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950";
export default function ImportPreview({
  parsed,
  selectedMonth,
  knownAliases,
  courses,
  expected,
  onClose,
  onAnalyze,
}) {
  const [month, setMonth] = useState(
    parsed.months.includes(selectedMonth)
      ? selectedMonth
      : parsed.months[0] || selectedMonth,
  );
  const [teacher, setTeacher] = useState(
    parsed.teachers.length === 1 ? parsed.teachers[0] : "",
  );
  const [excluded, setExcluded] = useState([]),
    [complete, setComplete] = useState(false),
    [aliases, setAliases] = useState(() => ({
      campuses: { ...knownAliases.campuses },
      classes: { ...knownAliases.classes },
      types: { ...knownAliases.types },
    }));
  const rows = parsed.rows.filter(
    (r) => r.email === teacher && r.date.startsWith(month),
  );
  const centres = [...new Set(rows.map((r) => r.centre))];
  const scope = centres.filter((c) => !excluded.includes(c));
  const picked = rows.filter((r) => scope.includes(r.centre));
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
      title="Xác nhận bảng và phạm vi"
      wide
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {picked.length} dòng ·{" "}
            {money(picked.reduce((n, r) => n + r.total, 0))}
          </span>
          <Button
            variant="primary"
            disabled={!teacher || !picked.length || parsed.errors.length > 0}
            onClick={() =>
              onAnalyze({
                month,
                teacher,
                scope,
                rows: picked,
                aliases,
                complete,
              })
            }
          >
            Đối chiếu {picked.length} dòng
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
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
            <p>Đóng cửa sổ và copy lại bảng đầy đủ.</p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Tháng công
            <select
              aria-label="Tháng công"
              className={select}
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setExcluded([]);
                setComplete(false);
              }}
            >
              {parsed.months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            Giáo viên
            <select
              aria-label="Giáo viên"
              className={select}
              value={teacher}
              onChange={(e) => {
                setTeacher(e.target.value);
                setExcluded([]);
                setComplete(false);
              }}
            >
              <option value="">Chọn giáo viên</option>
              {parsed.teachers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <fieldset>
          <legend className="mb-2 font-bold">
            Cơ sở có trong bảng đã copy
          </legend>
          <div className="flex flex-wrap gap-2">
            {centres.map((c) => (
              <label
                key={c}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700"
              >
                <input
                  type="checkbox"
                  checked={scope.includes(c)}
                  onChange={(e) =>
                    setExcluded((v) =>
                      e.target.checked ? v.filter((x) => x !== c) : [...v, c],
                    )
                  }
                />
                {c} · {rows.filter((r) => r.centre === c).length} dòng
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm dark:bg-brand-950">
          <input
            type="checkbox"
            className="mt-1"
            checked={complete}
            onChange={(e) => setComplete(e.target.checked)}
          />
          <span>
            <strong>Tôi đã copy đủ cả tháng cho các cơ sở được chọn.</strong>
            <span className="mt-1 block">
              Bật để tìm buổi thiếu và so tổng tháng. Nếu chỉ dán một phần, ứng
              dụng chỉ kiểm tra các dòng đã dán, không kết luận thiếu buổi.
            </span>
          </span>
        </label>
        <details open>
          <summary className="cursor-pointer font-bold">
            Tên cơ sở và lớp tương ứng trên web
          </summary>
          <p className="my-2 text-xs text-slate-500 dark:text-slate-400">
            Chỉ tự bỏ nhãn C4K/ROB. Không tự đổi VHRS thành cơ sở khác hay bỏ
            hậu tố HB.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {scope.map((c) => (
              <label key={c} className="text-sm">
                Cơ sở {c}
                <select
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
                </select>
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[...new Set(picked.map((r) => r.rawClass))].map((c) => (
              <label key={c} className="min-w-0 break-words text-sm">
                {c}
                <select
                  className={select}
                  value={aliases.classes[c] || ""}
                  onChange={(e) => change("classes", c, e.target.value)}
                >
                  <option value="">Tự chuẩn hóa: {canonicalClass(c)}</option>
                  {classNames.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </details>
        {[
          ...new Set(
            picked
              .filter((r) => r.type === "unknown")
              .map((r) => `${r.rawType}|${r.role}`),
          ),
        ].map((k) => (
          <label key={k} className="block text-sm font-bold">
            Phân loại {k}
            <select
              className={select}
              value={aliases.types[k] || "unknown"}
              onChange={(e) => change("types", k, e.target.value)}
            >
              {Object.entries(TYPES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        ))}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {parsed.rows.length - picked.length} dòng ngoài phạm vi sẽ không đối
          chiếu. {parsed.ignored} dòng ngoài bảng/tiêu đề lặp đã bỏ qua. Ngày
          giờ được quy về Việt Nam (UTC+7).
        </p>
      </div>
    </ModalShell>
  );
}
