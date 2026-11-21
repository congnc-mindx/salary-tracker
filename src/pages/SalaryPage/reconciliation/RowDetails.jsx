import { payrollCampusLabel, candidateSessions } from "./detailModel";
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
  const [choice, setChoice] = useState(item.expected?.members?.map(e=>e.id) || (item.expected ? [item.expected.id] : []));
  const [search, setSearch] = useState("");
  const [allCampuses, setAllCampuses] = useState(false);
  const r = item.source || item.expected;
  const fields = [
    ["Lớp", (x) => x.rawClass || x.title],
    ["Mã cơ sở bảng lương", (x) => payrollCampusLabel(x, item.source)],
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
      title={r.rawClass || r.title}
      description={`${r.date} · ${r.time}${item.source ? ` · STT ${item.source.stt}` : ""}`}
      wide
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          {!item.expected && item.source && item.source.type !== "class" && onAdd && <Button variant="reviewLoad" onClick={()=>{onClose();onAdd(item.source);}}>Thêm lịch</Button>}
          {item.expected && !item.expected.members && <Button variant="reviewLoad" onClick={()=>{onClose();onEdit(item.expected);}}>Chỉnh sửa</Button>}
          {item.decision && <Button onClick={()=>{onDecision(null, "");onClose();}}>Bỏ đánh dấu</Button>}
          {item.decision && <Button variant="reviewUpdate" onClick={()=>decide(item.decision.status)}>Cập nhật</Button>}
          <Button className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" onClick={() => decide("ask")}>Cần hỏi trung tâm</Button>
          <Button variant="reviewSave" onClick={() => decide("resolved")}>
            Đã xác minh
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {item.issues.length ? item.issues.join(" · ") : GROUPS[item.group]}
        </div>
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
        {item.expected && !item.source && <label className="block text-sm font-bold">Chờ ghi công tháng khác<input aria-label="Tháng dự kiến ghi công" type="month" className="ml-3 rounded-lg border bg-transparent p-2" onChange={e=>{if(e.target.value){onDefer(e.target.value);onClose();}}}/></label>}
        {item.source && <label className="block text-sm font-bold">Tìm lịch đã dạy trong tháng<input aria-label="Tháng dạy thực tế" type="month" value={matchMonth} onChange={e=>onMatchMonth(e.target.value)} className="ml-3 rounded-lg border bg-transparent p-2"/></label>}
        {item.source && (
          <details open={!item.expected} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-bold">{item.expected ? "Đổi buổi được ghép" : "Chọn buổi tương ứng"}</summary>
            <p className="my-3 text-xs text-slate-500 dark:text-slate-400">Chỉ dùng khi hệ thống chọn nhầm buổi hoặc chưa tìm thấy buổi tương ứng. Có thể chọn nhiều buổi cho một dòng bảng công. Lịch gốc được giữ nguyên.</p>
            <input aria-label="Tìm buổi để ghép" placeholder="Tìm mã lớp, ngày hoặc giờ…" value={search} onChange={e=>setSearch(e.target.value)} className="mb-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <label className="mb-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={allCampuses} onChange={e=>setAllCampuses(e.target.checked)} />Hiện thêm cơ sở khác</label>
            <div className="space-y-2">
              {["makeup","substitute","judge","trial","class"].map(type => {
                const rows = candidateSessions(expected, item.source, type, allCampuses).filter(e => normalizeSearch(label(e)).includes(normalizeSearch(search)));
                return <details key={type} open={type === item.source.type} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <summary className="cursor-pointer text-sm font-semibold">{TYPES[type]} · {rows.length} buổi</summary>
                  <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                    {!rows.length && <p className="py-2 text-xs text-slate-500">Không có buổi phù hợp bộ lọc.</p>}
                    {rows.map(e => <label key={e.id} className={`flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm ${choice.includes(e.id) ? "bg-brand-50 dark:bg-brand-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                      <input className="mt-1" type="checkbox" name="payroll-session" checked={choice.includes(e.id)} onChange={()=>setChoice(ids => ids.includes(e.id) ? ids.filter(id=>id!==e.id) : [...ids,e.id])} />
                      <span>{label(e)}{Object.entries(links).some(([source,id])=>(Array.isArray(id) ? id.includes(e.id) : id===e.id) && source!==item.source.id) && <span className="block text-xs text-amber-600">Đã ghép với dòng khác</span>}</span>
                    </label>)}
                  </div>
                </details>;
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" disabled={!choice.length} onClick={()=>{onLink(choice);onClose();}}>Ghép {choice.length} buổi đã chọn</Button>
              {Object.hasOwn(links,item.source.id) && <Button onClick={()=>{onLink(undefined);onClose();}}>Bỏ ghép thủ công</Button>}
              {item.expected && <Button onClick={()=>{onLink("");onClose();}}>Tách hai buổi</Button>}
            </div>
          </details>
        )}
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
      </div>
    </ModalShell>
  );
}
