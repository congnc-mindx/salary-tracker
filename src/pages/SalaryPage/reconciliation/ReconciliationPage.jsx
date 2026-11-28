import {confirmAction} from "../../../components/common/feedback";
import {payrollValue} from "./payrollLedger";
import {scopePayrollExpected} from "./scope";
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
  GROUPS,
  inheritDecisions,
  itemToken,
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
    [matchMonth, setMatchMonth] = useState(selectedMonth),
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
    const selectedRun = draft || saved ? {...(draft || saved),complete:true} : null;
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
  const ledger = payrollValue(run);
  const held = items.filter(i=>i.decision?.status === "ask").reduce((n,i)=>n+(i.source?.total || 0),0);
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
  function scopeExpected(all,r) { return scopePayrollExpected(all,r,history); }
  function change(fn) {
    if (lock.current || !run) return;
    const next = fn(run);
    setRun(next);
    setDirty(true);
    setError("");
    setMessage("");
    void save(next).catch(()=>{});
  }
  async function analyze(config) {
    if(config.salaryOnly && !config.complete) { setError("Xác nhận đã copy đủ tháng trước khi cập nhật lương."); return; }
    if (config.month !== selectedMonth) { setError("Bảng thuộc tháng khác. Hãy chọn đúng tháng trên header trước khi nhập."); return; }
    if (
      run &&
      dirty &&
      !await confirmAction("Thay bản đối soát chưa lưu bằng bảng mới?")
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
      deferred: previous?.deferred || {},
      previousId: previous?.id || null,
      changes: previous ? changesSince(previous.rows, config.rows) : null,
    };
    setRun(next);
    setDirty(true);
    setFilter("review");
    setSearch("");
    setError("");
    setMessage("");
    await save(next).catch(()=>{});
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
      const others = [...new Set(history.map(h=>h.month))].filter(m=>m!==candidate.month).map(m=>selectMonthlyPayroll(history,m));
      const claimed = new Set(others.flatMap(h=>Object.values(h.links||{}).flat()).filter(Boolean));
      if(Object.values(candidate.links||{}).flat().some(id=>id && claimed.has(id))) throw Error("Buổi này đã được ghép trong bảng công tháng khác. Bỏ ghép cũ trước khi chuyển tháng.");
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
      throw e;
    } finally {
      lock.current = false;
      setBusy(false);
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


      {!run && !loading && <div className={box}><h2 className="font-black">Chưa có bảng đối soát tháng {selectedMonth.slice(5)}/{selectedMonth.slice(0,4)}</h2><p className="mt-2 text-sm text-slate-500">Chọn nút Đối soát trên header để dán bảng lương. Mỗi tháng giữ một bản; lưu bảng mới sẽ thay bản của tháng đó.</p></div>}
      {loading && <p role="status">Đang tải bảng đối soát…</p>}
      {busy && <div role="status" className="text-xs text-slate-500">Đang lưu…</div>}
      {dirty && run && !busy && <div role="status" className="flex items-center gap-3 text-sm text-amber-600"><span>Chưa lưu được thay đổi. Bản nháp vẫn được giữ.</span><Button onClick={() => save().catch(()=>{})}>Thử lưu lại</Button></div>}
      {importOpen && !parsed && <ModalShell title="Dán bảng lương, kiểm tra chênh lệch" onClose={() => { if (!busy) setImportOpen(false); }} wide>
      <section>
        {error && <p role="alert" className="mb-3 text-sm text-red-500">{error}</p>}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
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
        <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
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
            Đọc bảng
          </Button>

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
                Bảng công T{Number(run.month.slice(5))}/{run.month.slice(0, 4)} · {run.rows?.length || 0} dòng
              </h2>

            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              ["Bảng trung tâm", money(run.settlement?.gross ?? totals.source)],
              ["Công sau tạm giữ", money(ledger?.gross ?? totals.source-held)],
              ["Tạm giữ", money(held)],
              [
                "Chênh lệch",
                run.complete && !run.salaryOnly && !run.settlement
                  ? money(totals.source - totals.expected)
                  : run.salaryOnly || run.settlement ? "Không đối chiếu" : "Chưa kết luận",
              ],

            ].map(([label, value]) => (
              <div key={label} className={box}>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-2 break-words text-lg font-black">{value}</p>
              </div>
            ))}
          </div>
          {run.settlement && !run.rows?.length && <p className="text-sm text-slate-500">Bản lương cũ chỉ lưu tổng tiền. Nhập lại bảng để xem từng dòng đối soát.</p>}
          {!run.salaryOnly && (!run.settlement || run.rows?.length > 0) && <>
          <div className="flex flex-wrap gap-2" aria-label="Bộ lọc đối soát">
            {Object.entries(GROUPS).filter(([key]) => key !== "matched" && (run.complete || key !== "missing")).map(([key,label]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`min-h-10 rounded-xl border px-3 text-xs font-bold ${filter === key ? "border-brand-500 bg-brand-600 text-white" : key === "resolved" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : key === "all" ? "border-slate-500/30 bg-slate-500/10" : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
              {label} · {items.filter(i => matchesFilter(i, key)).length}
            </button>)}
          </div>
          <input
            aria-label="Tìm dòng đối soát"
            placeholder="Tìm lớp, STT hoặc ngày YYYY-MM-DD…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          {Object.keys(run.deferred||{}).length > 0 && <details className={box}><summary className="cursor-pointer text-sm font-bold">Chờ ghi công tháng khác · {Object.keys(run.deferred).length} buổi</summary>{Object.entries(run.deferred).map(([id,month])=><div key={id} className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm"><span>{live.find(e=>e.id===id)?.title || id} · {live.find(e=>e.id===id)?.date} → {month}</span><Button disabled={busy} onClick={()=>change(r=>{const deferred={...r.deferred};delete deferred[id];return {...r,deferred};})}>Bỏ chuyển tháng</Button></div>)}</details>}
          <Results busy={busy} items={visible} onSelect={key=>{setMatchMonth(selectedMonth);setSelected(key);}} />
          </>}
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
          key={picked.key}
          busy={busy}
          error={error}
          item={picked}
          sourceItems={items.filter(i=>i.source)}
          onLinkSource={sourceId=>{
            const target=items.find(i=>i.source?.id===sourceId);
            const existing=target?.expected?.members?.map(e=>e.id) || (target?.expected ? [target.expected.id] : []);
            change(r=>({...r,links:{...r.links,[sourceId]:[...new Set([...existing,picked.expected.id])]}}));
            setSelected("source:"+sourceId);
          }}
          expected={live.filter(e=>e.date.startsWith(matchMonth))}
          payrollMonth={selectedMonth}
          matchMonth={matchMonth}
          onMatchMonth={setMatchMonth}
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
