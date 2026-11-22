import MonthPicker from "../../../components/common/MonthPicker";
import MatchCandidates from "./MatchCandidates";
import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import Button from "../../../components/common/Button";
import { money } from "../../../utils/format";
import { TYPES, GROUPS } from "./model";
export default function RowDetails({
  item,
  sourceItems = [],
  onLinkSource,
  busy = false,
  error = "",
  expected,
  links,
  onClose,
  onLink,
  onDecision,
  onEdit,
  onAdd,
  onMatchMonth,
  matchMonth,
  payrollMonth,
}) {
  const explicit = item.source ? links[item.source.id] : undefined;
  const choice = explicit !== undefined ? (Array.isArray(explicit) ? explicit : explicit ? [explicit] : []) : item.expected?.members?.map(e=>e.id) || (item.expected ? [item.expected.id] : []);
  const [search, setSearch] = useState("");
  const r = item.source || item.expected;
  const year = (payrollMonth || r.date).slice(0,4);
  const minMonth = `${year}-01` < "2023-03" ? "2023-03" : `${year}-01`;
  const maxMonth = `${year}-12`;
  const fields = [
    ["Ngày / giờ", (x) => `${x.date} ${x.time}`],
    ["Loại", (x) => x.type === "trial" && x.trialMode ? `Trải nghiệm ${x.trialMode === "ONL" ? "online" : "offline"}` : TYPES[x.type]],
    ["Thời lượng · Học sinh", (x) => `${x.hours} giờ · ${x.students ?? "Chưa lưu"} HS`],
    ["Tổng tiền", (x) => money(x.total)],
    ["Trạng thái", (x) => ({confirmed:"Đã xác nhận",planned:"Dự kiến",CHECKED:"Đã kiểm tra"}[x.status] || x.status)],
  ];
  function decide(status) {
    onDecision(status, item.decision?.note || "");
    onClose();
  }
  return (
    <ModalShell
      busy={busy}
      title={<span className="flex flex-wrap items-center gap-3"><span>{r.rawClass || r.title}</span><span title={item.issues.join(" · ")} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{GROUPS[item.group]}</span></span>}
      headerRight={<div className="min-w-48"><p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">{item.source ? "Tìm lịch đã dạy trong tháng" : "Tìm dòng bảng công trong tháng"}</p><MonthPicker min={minMonth} max={maxMonth} label="Tháng đối chiếu" value={matchMonth} onChange={onMatchMonth} disabled={busy}/></div>}
      description={`${r.date} · ${r.time}${item.source ? ` · STT ${item.source.stt}` : ""}`}
      wide
      onClose={onClose}
      footer={
        <fieldset disabled={busy} className="flex flex-wrap justify-end gap-2">
          {!item.expected && item.source && item.source.type !== "class" && onAdd && <Button variant="reviewLoad" onClick={()=>{onClose();onAdd(item.source);}}>Thêm lịch</Button>}
          {item.expected && !item.expected.members && <Button variant="reviewLoad" onClick={()=>{onClose();onEdit(item.expected);}}>Chỉnh sửa</Button>}
          {item.decision && <Button onClick={()=>{onDecision(null, "");onClose();}}>Bỏ đánh dấu</Button>}
          {item.decision && <Button variant="reviewUpdate" onClick={()=>decide(item.decision.status)}>Cập nhật</Button>}
          <Button className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" onClick={() => decide("ask")}>Cần hỏi trung tâm</Button>
          <Button variant="reviewSave" onClick={() => decide("resolved")}>
            Đã xác minh
          </Button>
        </fieldset>
      }
    >
      <fieldset disabled={busy} className="min-w-0 space-y-3">
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {busy && <p role="status" className="text-xs text-slate-500">Đang lưu lựa chọn…</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Lịch trên web", item.expected],
            ["Bảng trung tâm", item.source],
          ].map(([title, row]) => (
            <section
              key={title}
              className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <h4 className="mb-2 font-black">{title}</h4>
              {row ? (
                <dl className="space-y-1.5">
                  {fields.map(([name, fn]) => (
                    <div
                      key={name}
                      className="flex flex-wrap justify-between gap-x-3 text-sm"
                    >
                      <dt className="text-slate-500 dark:text-slate-400">
                        {name}
                      </dt>
                      <dd className="break-words font-semibold">{fn(row)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chưa có dòng tương ứng.
                </p>
              )}
            </section>
          ))}
        </div>

        <MatchCandidates
          rows={item.source ? expected.filter(e=>e.campus===item.source.campus) : sourceItems.map(i=>i.source).filter(e=>e.campus===item.expected.campus && e.date.startsWith(matchMonth))}
          type={r.type} search={search} onSearch={setSearch}
          selected={item.source ? choice : []}
          onSelect={id=>{if(!item.source) return onLinkSource(id); const next=choice.includes(id) ? choice.filter(x=>x!==id) : [...choice,id]; onLink(next.length ? next : "");}}
          isLinked={id=>item.source && Object.entries(links).some(([source,value])=>(Array.isArray(value) ? value.includes(id) : value===id) && source!==item.source.id)}
        />
      </fieldset>
    </ModalShell>
  );
}
