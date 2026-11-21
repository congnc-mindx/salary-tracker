import MonthPicker from "../../../components/common/MonthPicker";
import { candidateSessions } from "./detailModel";
import { normalizeSearch } from "../../../utils/courseDisplay";
import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import Button from "../../../components/common/Button";
import { money } from "../../../utils/format";
import { TYPES, GROUPS } from "./model";
const label = (r) =>
  `${r.title || r.rawClass} · ${r.date} ${r.time} · ${TYPES[r.type]}`;
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
  onDefer,
  onMatchMonth,
  matchMonth,
}) {
  const [note, setNote] = useState(item.decision?.note || "");
  const explicit = item.source ? links[item.source.id] : undefined;
  const choice = explicit !== undefined ? (Array.isArray(explicit) ? explicit : explicit ? [explicit] : []) : item.expected?.members?.map(e=>e.id) || (item.expected ? [item.expected.id] : []);
  const [search, setSearch] = useState("");
  const r = item.source || item.expected;
  const fields = [
    ["Ngày / giờ", (x) => `${x.date} ${x.time}`],
    ["Loại", (x) => TYPES[x.type]],
    ["Thời lượng", (x) => `${x.hours} giờ`],
    ["Học sinh", (x) => x.students ?? "Chưa lưu"],
    [
      "Đơn giá",
      (x) =>
        x.price != null ? money(x.price) + "/giờ" : "Theo quy tắc công việc",
    ],
    ["Tổng tiền", (x) => money(x.total)],
    ["Trạng thái", (x) => ({confirmed:"Đã xác nhận",planned:"Dự kiến",CHECKED:"Đã kiểm tra"}[x.status] || x.status)],
  ];
  function decide(status) {
    onDecision(status, note.trim());
    onClose();
  }
  return (
    <ModalShell
      busy={busy}
      title={<span className="flex flex-wrap items-center gap-3"><span>{r.rawClass || r.title}</span><span title={item.issues.join(" · ")} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{GROUPS[item.group]}</span></span>}
      headerRight={<div className="min-w-48"><p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">{item.source ? "Tìm lịch đã dạy trong tháng" : "Tìm dòng bảng công trong tháng"}</p><MonthPicker label="Tháng đối chiếu" value={matchMonth} onChange={onMatchMonth} disabled={busy}/></div>}
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
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {busy && <p role="status" className="text-xs text-slate-500">Đang lưu lựa chọn…</p>}
        {item.expected?.members && <div className="rounded-xl bg-brand-500/10 p-3 text-sm"><strong>{item.expected.members.length} ca được gộp · {money(item.expected.total)}</strong>{item.expected.members.map(e=><div key={e.id}>{e.title} · {e.date} {e.time} · {money(e.total)}</div>)}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Lịch trên web", item.expected],
            ["Bảng trung tâm", item.source],
          ].map(([title, row]) => (
            <section
              key={title}
              className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <h4 className="mb-3 font-black">{title}</h4>
              {row ? (
                <dl className="space-y-2">
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

        {item.source && (
          <details open className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-bold">{item.expected ? "Đổi buổi được ghép" : "Chọn buổi tương ứng"}</summary>
            <p className="my-3 text-xs text-slate-500 dark:text-slate-400">Chỉ dùng khi hệ thống chọn nhầm buổi hoặc chưa tìm thấy buổi tương ứng. Có thể chọn nhiều buổi cho một dòng bảng công. Lịch gốc được giữ nguyên.</p>
            <input aria-label="Tìm buổi để ghép" placeholder="Tìm mã lớp, ngày, ghi chú hoặc loại ca khác…" value={search} onChange={e=>setSearch(e.target.value)} className="mb-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <div className="space-y-2">
              {(search.trim() ? ["makeup","substitute","judge","trial","class"] : [item.source.type]).map(type => {
                const rows = candidateSessions(expected, item.source, type).filter(e => normalizeSearch(`${label(e)} ${e.note || ""}`).includes(normalizeSearch(search)));
                if(search.trim() && !rows.length) return null;
                return <details key={type} open className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <summary className="cursor-pointer text-sm font-semibold">{TYPES[type]} · {rows.length} buổi</summary>
                  <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                    {!rows.length && <p className="py-2 text-xs text-slate-500">Không có buổi phù hợp bộ lọc.</p>}
                    {rows.map(e => <label key={e.id} className={`flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm ${choice.includes(e.id) ? "bg-brand-50 dark:bg-brand-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                      <input className="mt-1" type="checkbox" name="payroll-session" checked={choice.includes(e.id)} onChange={()=>{const next=choice.includes(e.id) ? choice.filter(id=>id!==e.id) : [...choice,e.id];onLink(next.length ? next : "");}} />
                      <span>{label(e)}{e.note && <span className="text-slate-500 dark:text-slate-400"> · {e.note}</span>}{Object.entries(links).some(([source,id])=>(Array.isArray(id) ? id.includes(e.id) : id===e.id) && source!==item.source.id) && <span className="block text-xs text-amber-600">Đã ghép với dòng khác</span>}</span>
                    </label>)}
                  </div>
                </details>;
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
            </div>
          </details>
        )}
        {!item.source && item.expected && <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h4 className="text-sm font-bold">Chọn buổi tương ứng</h4>
          <input aria-label="Tìm dòng bảng công" placeholder="Tìm mã lớp, ngày, ghi chú hoặc loại ca khác…" value={search} onChange={e=>setSearch(e.target.value)} className="my-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"/>
          <div className="max-h-56 space-y-1 overflow-y-auto">{sourceItems.filter(i=>i.source.campus===item.expected.campus && i.source.date.startsWith(matchMonth) && (search.trim() ? normalizeSearch(`${label(i.source)} ${i.source.note||""}`).includes(normalizeSearch(search)) : i.source.type===item.expected.type)).map(i=><label key={i.key} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><input type="checkbox" checked={false} onChange={()=>onLinkSource(i.source.id)}/><span>{label(i.source)}{i.source.note && <span className="text-slate-500"> · {i.source.note}</span>} · {money(i.source.total)}</span></label>)}</div>
          {!sourceItems.some(i=>i.source.campus===item.expected.campus && i.source.date.startsWith(matchMonth) && (search.trim() ? normalizeSearch(`${label(i.source)} ${i.source.note||""}`).includes(normalizeSearch(search)) : i.source.type===item.expected.type)) && <p className="text-xs text-slate-500">Không có dòng bảng công phù hợp trong tháng này.</p>}
        </section>}
        {item.expected && !item.source && <details className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><summary className="cursor-pointer text-sm font-bold">Chờ ghi công tháng khác</summary><div className="mt-3 max-w-60"><MonthPicker label="Tháng dự kiến ghi công" onChange={month=>{onDefer(month);onClose();}} disabled={busy}/></div></details>}
        {!item.expected && item.source?.type === "class" && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đây là lịch lớp. Kiểm tra lớp và lịch nghỉ trong “Lớp học của tôi”;
            không tự tạo một khóa học từ một dòng bảng lương.
          </p>
        )}
        <label className="block text-sm font-bold">
          Ghi chú xác minh (không bắt buộc)
          <textarea
            aria-label="Ghi chú xác minh"
            value={note}
            maxLength={2000}
            onChange={(e) => {
              setNote(e.target.value);
            }}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950"
            placeholder="Ví dụ: Đã hỏi cơ sở, buổi này được duyệt đơn giá riêng…"
          />
        </label>
      </fieldset>
    </ModalShell>
  );
}
