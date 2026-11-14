import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../../components/common/Button";
import { money } from "../../../utils/format";
import { getCampusCode, normalizeSearch } from "../../../utils/courseDisplay";
import { parsePayroll } from "./parser";
import { buildExpected } from "./expected";
import {
  comparePayroll,
  defaultCampus,
  GROUPS,
  inheritDecisions,
  itemToken,
  questionText,
  summaryOf,
  signature,
  changesSince,
} from "./model";
import {
  loadPayrollAliases,
  loadPayrollHistory,
  savePayrollDocument,
} from "./storage";
import { validatePayrollDocument } from "./validation";
import ImportPreview from "./ImportPreview";
import RowDetails from "./RowDetails";
import Results from "./Results";
const box =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900";
function readDraft(userId) {
  if (!userId) return null;
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("mindx-payroll-draft:" + userId),
    );
    if (!saved) return null;
    validatePayrollDocument(saved.id || "payrollRun_draft", saved);
    return saved;
  } catch {
    return null;
  }
}
const emptyAliases = { revision: 0, campuses: {}, classes: {}, types: {} };
export default function ReconciliationPage({
  active,
  userId,
  selectedMonth,
  onSelectMonth,
  courses = [],
  sessions = [],
  extras = [],
  holidays = [],
  settings,
  onEditCourse,
  onEditExtra,
  onAddPayrollExtra,
}) {
  const [text, setText] = useState(""),
    [parsed, setParsed] = useState(null),
    [run, setRun] = useState(() => readDraft(userId)),
    [history, setHistory] = useState([]),
    [aliases, setAliases] = useState(emptyAliases);
  const [filter, setFilter] = useState("review"),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(Boolean(run)),
    [loading, setLoading] = useState(false);
  const loaded = useRef(""),
    lock = useRef(false);
  const live = useMemo(
    () => buildExpected({ courses, sessions, extras, holidays, settings }),
    [courses, sessions, extras, holidays, settings],
  );
  useEffect(() => {
    if (!active || !userId || loaded.current === userId) return;
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      loadPayrollHistory(userId),
      loadPayrollAliases(userId),
    ]).then((results) => {
      if (cancelled) return;
      loaded.current = userId;
      if (results[0].status === "fulfilled") setHistory(results[0].value);
      if (results[1].status === "fulfilled") setAliases(results[1].value);
      const failure = results.find((r) => r.status === "rejected");
      if (failure)
        setError("Chưa tải được lịch sử/quy tắc: " + failure.reason.message);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [active, userId]);
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!userId) return;
    try {
      if (dirty && run)
        sessionStorage.setItem(
          "mindx-payroll-draft:" + userId,
          JSON.stringify(run),
        );
      else sessionStorage.removeItem("mindx-payroll-draft:" + userId);
    } catch {
      setError(
        "Không giữ được bản tạm trong tab. Hãy lưu lần đối soát trước khi chuyển trang.",
      );
    }
  }, [run, dirty, userId]);
  const items = useMemo(
    () =>
      run
        ? comparePayroll(
            run.rows,
            run.expected,
            run.aliases,
            run.links,
            run.decisions,
            run.complete,
          )
        : [],
    [run],
  );
  const totals = summaryOf(items);
  const asks = items.filter((i) => i.decision?.status === "ask");
  const scopedLive = run ? scopeExpected(live, run) : [];
  const stale = run && signature(scopedLive) !== signature(run.expected);
  const matchesFilter = (item, key) =>
    key === "all" || key === "resolved"
      ? key === "all" || item.decision?.status === "resolved"
      : key === "review"
        ? item.group !== "matched" && item.decision?.status !== "resolved"
        : item.group === key && item.decision?.status !== "resolved";
  const visible = items.filter(
    (i) =>
      matchesFilter(i, filter) &&
      normalizeSearch(
        `${i.source?.rawClass || ""} ${i.expected?.title || ""} ${i.source?.stt || ""} ${(i.source || i.expected).date}`,
      ).includes(normalizeSearch(search)),
  );
  const picked = items.find((i) => i.key === selected);
  function scopeExpected(all, r) {
    const campuses = new Set(
      r.scope.map((c) => r.aliases.campuses[c] || defaultCampus(c)),
    );
    return all.filter(
      (e) => e.date.startsWith(r.month) && campuses.has(e.campus),
    );
  }
  function change(fn) {
    setRun((r) => fn(r));
    setDirty(true);
    setError("");
    setMessage("");
  }
  function analyze(config) {
    if (
      run &&
      dirty &&
      !window.confirm("Thay bản đối soát chưa lưu bằng bảng mới?")
    )
      return;
    const previous =
      run && run.month === config.month && run.teacher === config.teacher
        ? run
        : history.find(
            (r) => r.month === config.month && r.teacher === config.teacher,
          );
    const inherited = inheritDecisions(previous, config.rows);
    const next = {
      ...config,
      schemaVersion: 1,
      id: null,
      revision: 0,
      createdAt: Date.now(),
      expected: scopeExpected(live, config),
      ...inherited,
      previousId: previous?.id || null,
      changes: previous ? changesSince(previous.rows, config.rows) : null,
    };
    setRun(next);
    setParsed(null);
    setDirty(true);
    setFilter("review");
    setSearch("");
    setError("");
    setMessage("");
    onSelectMonth?.(config.month);
  }
  async function save(asNew = false) {
    if (lock.current || !run) return;
    if (!userId) {
      setError("Cần đăng nhập để lưu lịch sử.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const id =
        asNew || !run.id
          ? "payrollRun_" + Date.now() + "_" + crypto.randomUUID().slice(0, 8)
          : run.id;
      const saved = await savePayrollDocument(
        userId,
        id,
        { ...run, id, createdAt: asNew ? Date.now() : run.createdAt },
        asNew ? 0 : run.revision,
      );
      setRun(saved);
      setDirty(false);
      setHistory((h) =>
        [saved, ...h.filter((r) => r.id !== id)]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 30),
      );
      setMessage("Đã lưu lần đối soát. Dữ liệu lương gốc không bị thay đổi.");
      try {
        const remembered = await savePayrollDocument(
          userId,
          "payrollAliases",
          { ...run.aliases },
          aliases.revision || 0,
        );
        setAliases(remembered);
      } catch (e) {
        setMessage(
          "Đã lưu kết quả. Chưa ghi nhớ quy tắc cho lần sau: " + e.message,
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function openSaved(id) {
    const saved = history.find((r) => r.id === id);
    if (!saved) return;
    if (dirty && !window.confirm("Mở lịch sử và bỏ thay đổi chưa lưu?")) return;
    try {
      validatePayrollDocument(saved.id, saved);
      setRun(saved);
      setDirty(false);
      setFilter("review");
      setSearch("");
      setMessage(
        "Đang xem dữ liệu tại thời điểm lưu, không phải dữ liệu web mới nhất.",
      );
      setError("");
      onSelectMonth?.(saved.month);
    } catch (e) {
      setError(e.message);
    }
  }
  function refresh() {
    if (!run) return;
    change((r) => ({ ...r, expected: scopeExpected(live, r) }));
    setMessage(
      "Đã đối chiếu lại. Đánh dấu cũ chỉ còn hiệu lực với các dòng không thay đổi.",
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(questionText(items, run.month));
      setMessage("Đã sao chép danh sách cần hỏi trung tâm.");
    } catch {
      setError("Không sao chép được. Dùng ô văn bản bên dưới để chọn và copy.");
    }
  }
  function edit(e) {
    if (e.courseId) {
      const course = courses.find((c) => c.id === e.courseId);
      if (course) onEditCourse?.(course);
      else setError("Lớp đã bị xóa khỏi dữ liệu hiện tại.");
    } else {
      const extra = extras.find((x) => x.id === e.extraId);
      if (extra) onEditExtra?.(extra);
      else setError("Lịch phát sinh không còn trong dữ liệu hiện tại.");
    }
  }
  function add(r) {
    const campusName =
      courses.find((c) => getCampusCode(c.campus) === r.campus)?.campus ||
      live.find((e) => e.campus === r.campus)?.campusName;
    if (!campusName && r.type !== "trial") {
      setError("Hãy xác định cơ sở tương ứng trước khi thêm lịch.");
      return;
    }
    onAddPayrollExtra?.({
      type: r.type,
      classCode: r.classKey,
      campus: campusName || "",
      datetime: r.date + "T" + r.time,
      hours: r.hours,
      studentCount: r.students,
      note: `Từ bảng lương STT ${r.stt}. Cần kiểm tra lại trước khi lưu.`,
    });
  }
  return (
    <div hidden={!active} className="space-y-5">
      <section className={box}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">
              Dán bảng lương, kiểm tra chênh lệch
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Copy cả hàng tiêu đề và các dòng của trung tâm. Không cần sửa mã
              lớp hay xóa cột thừa.
            </p>
          </div>
          {dirty && (
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              Có thay đổi chưa lưu
            </span>
          )}
        </div>
        <textarea
          aria-label="Dán bảng lương trung tâm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={run ? 3 : 6}
          maxLength={3000000}
          placeholder={
            "STT\tCentre shortname\tType\tClass name\t…\tTotal\nDán bảng đã copy từ Excel hoặc bảng check lương vào đây."
          }
          className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-6 focus:outline-brand-500 dark:border-slate-700 dark:bg-slate-950"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="primary"
            disabled={!text.trim() || busy}
            onClick={() => {
              try {
                setParsed(parsePayroll(text));
                setError("");
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Đọc bảng và chọn phạm vi
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Chỉ đối chiếu. Không tự thêm lịch hay sửa lương.
          </span>
        </div>
      </section>
      <section className="flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 text-sm font-bold">
          Lịch sử đối soát
          <select
            aria-label="Lịch sử đối soát"
            className="ml-0 mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal dark:border-slate-700 dark:bg-slate-900"
            value={run?.id || ""}
            onChange={(e) => openSaved(e.target.value)}
          >
            <option value="">
              {loading
                ? "Đang tải lịch sử…"
                : "Chọn một lần đã lưu (30 lần gần nhất)"}
            </option>
            {history.map((h) => (
              <option key={h.id} value={h.id}>
                {h.month} · {h.teacher} ·{" "}
                {new Date(h.createdAt).toLocaleString("vi-VN")} ·{" "}
                {h.rows?.length || 0} dòng
              </option>
            ))}
          </select>
        </label>
        {run && (
          <>
            <Button disabled={busy} onClick={() => save(false)}>
              {busy ? "Đang lưu…" : "Lưu lần đối soát"}
            </Button>
            {run.id && (
              <Button disabled={busy} onClick={() => save(true)}>
                Lưu thành lần mới
              </Button>
            )}
          </>
        )}
      </section>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        >
          {message}
        </p>
      )}
      {run && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">
                Tháng công {run.month.slice(5)}/{run.month.slice(0, 4)}
              </h2>
              <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                {run.teacher} · {run.scope.join(", ")} · {run.rows.length} dòng
                trung tâm
              </p>
            </div>
            <Button onClick={refresh} disabled={busy}>
              Đối chiếu lại dữ liệu web
            </Button>
          </div>
          {selectedMonth !== run.month && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tháng trên header đã đổi. Kết quả này vẫn thuộc tháng công{" "}
              {run.month}; dán bảng mới hoặc mở lịch sử tương ứng.
            </p>
          )}
          {stale && (
            <p
              role="status"
              className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            >
              Dữ liệu web khác bản đang đối chiếu. Bấm “Đối chiếu lại dữ liệu
              web” sau khi sửa/thêm lịch.
            </p>
          )}
          {!run.complete && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Bảng copy một phần: chỉ kiểm tra các dòng đã dán. Không kết luận
              thiếu buổi hoặc chênh tổng tháng.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              [
                "Theo web" + (run.complete ? "" : " (đã ghép)"),
                money(totals.expected),
              ],
              ["Bảng trung tâm", money(totals.source)],
              [
                "Trung tâm − web",
                run.complete
                  ? money(totals.source - totals.expected)
                  : "Chưa kết luận",
              ],
              ["Cần kiểm tra", `${totals.needsReview} mục`],
            ].map(([label, value]) => (
              <div key={label} className={box}>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-2 break-words text-lg font-black">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            CHECKED không có nghĩa đã nhận tiền. Tổng bằng nhau chưa đủ để xác
            nhận khớp từng buổi.
            {run.changes &&
              ` So với lần trước: thêm ${run.changes.added}, bỏ ${run.changes.removed}, đổi ${run.changes.changed} dòng (theo STT).`}
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GROUPS)
              .filter(([k]) => run.complete || k !== "missing")
              .map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={`min-h-11 rounded-xl px-3 text-xs font-bold ${filter === key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                >
                  {label} · {items.filter((i) => matchesFilter(i, key)).length}
                </button>
              ))}
          </div>
          <input
            aria-label="Tìm dòng đối soát"
            placeholder="Tìm lớp, STT hoặc ngày YYYY-MM-DD…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <Results items={visible} onSelect={setSelected} />
          {asks.length > 0 && (
            <section className={box}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-black">
                  Danh sách cần hỏi trung tâm · {asks.length} mục
                </h3>
                <Button onClick={copy}>Sao chép danh sách cần hỏi</Button>
              </div>
              <textarea
                aria-label="Nội dung cần hỏi trung tâm"
                readOnly
                value={questionText(items, run.month)}
                rows={5}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </section>
          )}
        </>
      )}
      {parsed && (
        <ImportPreview
          parsed={parsed}
          selectedMonth={selectedMonth}
          knownAliases={run?.aliases || aliases}
          courses={courses}
          expected={live}
          onClose={() => setParsed(null)}
          onAnalyze={analyze}
        />
      )}
      {picked && (
        <RowDetails
          key={picked.key + itemToken(picked)}
          item={picked}
          expected={run.expected}
          links={run.links}
          onClose={() => setSelected(null)}
          onLink={(value) =>
            change((r) => {
              const links = { ...r.links };
              if (value === undefined) delete links[picked.source.id];
              else links[picked.source.id] = value;
              return { ...r, links };
            })
          }
          onDecision={(status, note) =>
            change((r) => {
              const decisions = { ...r.decisions };
              if (status)
                decisions[picked.key] = {
                  status,
                  note,
                  token: itemToken(picked),
                };
              else delete decisions[picked.key];
              return { ...r, decisions };
            })
          }
          onEdit={edit}
          onAdd={onAddPayrollExtra ? add : null}
        />
      )}
    </div>
  );
}
