import { monthlyPayrollId, selectMonthlyPayroll } from "./monthly";
import ModalShell from "../../../components/common/ModalShell";
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
const emptyAliases = { revision: 0, campuses: {}, classes: {}, types: {} };
export default function ReconciliationPage({
  active,
  userId,
  selectedMonth,
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
    [importOpen, setImportOpen] = useState(false),
    [parsed, setParsed] = useState(null),
    [run, setRun] = useState(null),
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
  const viewedMonth = useRef(selectedMonth);
  const restoredMonth = useRef("");
  useEffect(() => { viewedMonth.current = selectedMonth; }, [selectedMonth]);
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
    const open = () => { if (lock.current) return; setImportOpen(true); setText(""); setError(""); };
    window.addEventListener("mindx:import-payroll", open);
    return () => window.removeEventListener("mindx:import-payroll", open);
  }, []);
  useEffect(() => {
    if (loading || loaded.current !== userId) return;
    const key = `${userId}:${selectedMonth}`;
    if (restoredMonth.current === key) return;
    restoredMonth.current = key;
    const saved = selectMonthlyPayroll(history, selectedMonth);
    let draft = null;
    try { draft = JSON.parse(sessionStorage.getItem(`mindx-payroll:${userId}:${selectedMonth}`)); } catch {}
    if (draft) { try { validatePayrollDocument(draft.id || "payrollRun_draft", draft); } catch { draft = null; } }
    const selectedRun = draft || saved || null;
    if (selectedRun?.aliases?.campuses?.["HN-VHRS"] === "LB") {
      const aliases = {...selectedRun.aliases, campuses: {...selectedRun.aliases.campuses, "HN-VHRS": "VHRS"}, classes: Object.fromEntries(Object.entries(selectedRun.aliases.classes || {}).map(([key,value]) => [key, value.replace(/^LB-/, "VHRS-")]))};
      setRun({...selectedRun, aliases});
    } else setRun(selectedRun);
    setDirty(Boolean(draft));
    setSelected(null); setFilter("review"); setSearch(""); setMessage("");
  }, [selectedMonth, history, loading, userId]);
  useEffect(() => {
    if (!run || !userId) return;
    try {
      const key = `mindx-payroll:${userId}:${run.month}`;
      if (dirty) sessionStorage.setItem(key, JSON.stringify(run));
      else sessionStorage.removeItem(key);
    } catch { setError("Không giữ được bản nháp. Hãy lưu trước khi chuyển tháng."); }
  }, [run, dirty, userId]);
  const currentExpected = run ? scopeExpected(live, run) : [];
  const items = run ? comparePayroll(run.rows, currentExpected, run.aliases, run.links, run.decisions, run.complete) : [];
  const totals = summaryOf(items);
  const asks = items.filter((i) => i.decision?.status === "ask");
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
    if (lock.current || !run) return;
    const next = fn(run);
    setRun(next);
    setDirty(true);
    setError("");
    setMessage("");
    void save(next);
  }
  async function analyze(config) {
    if (config.month !== selectedMonth) { setError("Bảng thuộc tháng khác. Hãy chọn đúng tháng trên header trước khi nhập."); return; }
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
    setDirty(true);
    setFilter("review");
    setSearch("");
    setError("");
    setMessage("");
    await save(next);
  }
  async function save(candidate = run) {
    if (lock.current || !candidate) return;
    if (!userId) {
      setError("Cần đăng nhập để lưu lịch sử.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const id = monthlyPayrollId(candidate.month);
      const existing = history.find(r => r.id === id);
      const saved = await savePayrollDocument(userId, id,
        {...candidate, id, expected: scopeExpected(live, candidate)},
        existing?.revision || 0);
      try { sessionStorage.removeItem(`mindx-payroll:${userId}:${candidate.month}`); } catch {}
      setImportOpen(false); setParsed(null); setText("");
      if (viewedMonth.current === candidate.month) {
        setRun(saved);
        setDirty(false);
      }
      setHistory((h) =>
        [saved, ...h.filter((r) => r.month !== saved.month)]
          .sort((a, b) => b.createdAt - a.createdAt)
,
      );
      setMessage("");
      if (candidate.aliases !== run?.aliases) try {
        const remembered = await savePayrollDocument(
          userId,
          "payrollAliases",
          { ...candidate.aliases },
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
      {!run && !loading && <div className={box}><h2 className="font-black">Chưa có bảng đối soát tháng {selectedMonth.slice(5)}/{selectedMonth.slice(0,4)}</h2><p className="mt-2 text-sm text-slate-500">Chọn nút Nhập bảng lương trên header để dán bảng lương. Mỗi tháng giữ một bản; lưu bảng mới sẽ thay bản của tháng đó.</p></div>}
      {loading && <p role="status">Đang tải bảng đối soát…</p>}
      {busy && <div role="status" className="text-xs text-slate-500">Đang lưu…</div>}
      {dirty && run && !busy && <div role="status" className="flex items-center gap-3 text-sm text-amber-600"><span>Chưa lưu được thay đổi. Bản nháp vẫn được giữ.</span><Button onClick={() => save()}>Thử lưu lại</Button></div>}
      {importOpen && !parsed && <ModalShell title={run ? "Cập nhật bảng đối soát" : "Đối soát bảng lương"} onClose={() => { if (!busy) setImportOpen(false); }} wide>
      <section className={box}>
        {error && <p role="alert" className="mb-3 text-sm text-red-500">{error}</p>}
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
          rows={8}
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
      </ModalShell>}
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
                Bảng công T{Number(run.month.slice(5))}/{run.month.slice(0, 4)} · {run.rows.length} dòng
              </h2>

            </div>
          </div>
          {!run.complete && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Bảng copy một phần: chỉ kiểm tra các dòng đã dán. Không kết luận
              thiếu buổi hoặc chênh tổng tháng.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              [
                "Theo lịch dạy" + (run.complete ? "" : " (đã ghép)"),
                money(totals.expected),
              ],
              ["Bảng trung tâm", money(totals.source)],
              [
                "Chênh lệch",
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
          <div className="flex flex-wrap items-center gap-2" aria-label="Bộ lọc đối soát">
            {["review", "resolved", "all"].map(key => <button key={key} type="button" aria-pressed={filter === key || (key === "review" && ["missing", "extra", "different", "ambiguous"].includes(filter))} onClick={() => setFilter(key)} className={`min-h-11 rounded-xl px-3 text-xs font-bold ${filter === key || (key === "review" && ["missing", "extra", "different", "ambiguous"].includes(filter)) ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
              {GROUPS[key]} · {items.filter(i => matchesFilter(i, key)).length}
            </button>)}
            <select aria-label="Loại cần kiểm tra" value={["missing", "extra", "different", "ambiguous"].includes(filter) ? filter : "review"} onChange={e => setFilter(e.target.value)} className="min-h-11 max-w-full rounded-xl border border-slate-300 bg-white pl-3 pr-9 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">
              <option value="review">Tất cả loại sai lệch</option>
              {["different", "missing", "extra", "ambiguous"].filter(key => run.complete || key !== "missing").map(key => <option key={key} value={key}>{GROUPS[key]} · {items.filter(i => matchesFilter(i, key)).length}</option>)}
            </select>
          </div>
          <input
            aria-label="Tìm dòng đối soát"
            placeholder="Tìm lớp, STT hoặc ngày YYYY-MM-DD…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <Results busy={busy} items={visible} onSelect={setSelected} />
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
        <ImportPreview configuredCampuses={settings.campuses || []}
          parsed={parsed}
          busy={busy}
          error={error}
          selectedMonth={selectedMonth}
          knownAliases={run?.aliases || aliases}
          courses={courses}
          expected={live}
          onClose={() => { if (!busy) setParsed(null); }}
          onAnalyze={analyze}
        />
      )}
      {picked && (
        <RowDetails
          key={picked.key + itemToken(picked)}
          item={picked}
          expected={currentExpected}
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
