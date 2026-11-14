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
}) {
  const [note, setNote] = useState(item.decision?.note || "");
  const [choice, setChoice] = useState(item.expected?.id || "");
  const [error, setError] = useState("");
  const r = item.source || item.expected;
  const fields = [
    ["Lớp", (x) => x.rawClass || x.title],
    ["Cơ sở", (x) => x.centre || x.campusName || x.campus],
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
    ["Trạng thái", (x) => x.status],
  ];
  function decide(status) {
    if (status === "resolved" && !note.trim()) {
      setError("Ghi lý do xác minh để lần sau biết vì sao chấp nhận.");
      return;
    }
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
          <Button onClick={() => decide("ask")}>Cần hỏi trung tâm</Button>
          <Button variant="primary" onClick={() => decide("resolved")}>
            Đã xác minh
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {item.issues.length ? item.issues.join(" · ") : GROUPS[item.group]}
        </div>
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
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <label className="block text-sm font-bold">
              Ghép với lịch trên web
              <select
                aria-label="Ghép với lịch trên web"
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Không ghép</option>
                {expected.map((e) => (
                  <option key={e.id} value={e.id}>
                    {label(e)}
                    {Object.entries(links).some(
                      ([s, id]) => id === e.id && s !== item.source.id,
                    )
                      ? " — đã ghép thủ công"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            {item.candidates.length > 0 && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Có {item.candidates.length} lịch cùng ngày có thể liên quan.
                Chọn rõ lịch để xác nhận; không tự ghép khi lệch giờ.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  onLink(choice);
                  onClose();
                }}
              >
                Áp dụng liên kết
              </Button>
              <Button
                onClick={() => {
                  onLink(undefined);
                  onClose();
                }}
              >
                Để hệ thống ghép lại
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {item.expected && onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit(item.expected);
              }}
            >
              Sửa lịch trên web
            </Button>
          )}
          {!item.expected &&
            item.source &&
            ["makeup", "substitute", "judge", "trial"].includes(
              item.source.type,
            ) &&
            onAdd && (
              <Button
                onClick={() => {
                  onClose();
                  onAdd(item.source);
                }}
              >
                Thêm lịch từ dòng này
              </Button>
            )}
        </div>
        {!item.expected && item.source?.type === "class" && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đây là lịch lớp. Kiểm tra lớp và lịch nghỉ trong “Lớp học của tôi”;
            không tự tạo một khóa học từ một dòng bảng lương.
          </p>
        )}
        <label className="block text-sm font-bold">
          Ghi chú xử lý
          <textarea
            aria-label="Ghi chú xử lý"
            value={note}
            maxLength={2000}
            onChange={(e) => {
              setNote(e.target.value);
              setError("");
            }}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950"
            placeholder="Ví dụ: Đã hỏi cơ sở, buổi này được duyệt đơn giá riêng…"
          />
        </label>
        {item.decision && (
          <Button
            onClick={() => {
              onDecision(null, "");
              onClose();
            }}
          >
            Bỏ đánh dấu xử lý
          </Button>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Đánh dấu xác minh không sửa lương hoặc xác nhận đã nhận tiền. Sau khi
          sửa/thêm lịch, chọn “Đối chiếu lại dữ liệu web”.
        </p>
      </div>
    </ModalShell>
  );
}
