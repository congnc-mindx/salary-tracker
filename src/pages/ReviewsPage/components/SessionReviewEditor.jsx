import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import {
  buildSessionReview,
  createSessionDraft,
  hasHomework,
  normalizeComments,
} from "../sessionReviewsModel";

export default function SessionReviewEditor({
  title,
  subject,
  sessionNo,
  total = 14,
  saved,
  template,
  isTemplate = false,
  onSave,
  onClose,
}) {
  const [value, setValue] = useState(() =>
    createSessionDraft(saved, template, subject),
  );
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(createSessionDraft(saved, template, subject)),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const dirty = JSON.stringify(value) !== baseline;
  const output = buildSessionReview(value, sessionNo, total);
  function change(key, text) {
    setValue((v) => ({
      ...v,
      [key]: text,
      ...(isTemplate ? {} : { status: "draft" }),
    }));
    setMessage("");
  }
  async function save(status = "draft") {
    if (busy) return;
    if (!value.content.trim()) {
      setMessage("Hãy nhập nội dung buổi học.");
      return;
    }
    if (status === "sent" && !value.comments.trim()) {
      setMessage("Hãy nhập nhận xét học sinh trước khi đánh dấu đã gửi.");
      return;
    }
    setBusy(true);
    const next = { ...value, status };
    try {
      if (await onSave(next)) {
        setValue(next);
        setBaseline(JSON.stringify(next));
        onClose();
      } else setMessage("Chưa lưu được. Nội dung đang nhập vẫn được giữ lại.");
    } catch {
      setMessage("Chưa lưu được. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setMessage(
        "Đã sao chép. Tích Hoàn thành trên thẻ buổi học sau khi bạn đã lấy nhận xét.",
      );
    } catch {
      setMessage(
        "Không sao chép được. Hãy chọn văn bản trong ô xem trước để sao chép thủ công.",
      );
    }
  }
  const button =
    "rounded-xl bg-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-40 dark:bg-slate-800";
  const input =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal leading-relaxed dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  return (
    <ModalShell
      title={title}
      busy={busy}
      description={`Buổi ${sessionNo}/${total} · ${value.subject || "Chưa chọn học phần"}`}
      onClose={() => {
        if (!busy && (!dirty || window.confirm("Bỏ các thay đổi chưa lưu?")))
          onClose();
      }}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        {!isTemplate && template && (
          <button
            type="button"
            className={button}
            onClick={() => {
              if (
                window.confirm(
                  "Lấy lại nội dung bài học và bài tập từ mẫu? Nhận xét học sinh được giữ nguyên.",
                )
              ) {
                const fresh = createSessionDraft(null, template, subject);
                setValue((v) => ({
                  ...v,
                  content: fresh.content,
                  homework: fresh.homework,
                  subject,
                  status: "draft",
                }));
              }
            }}
          >
            Lấy lại nội dung mẫu
          </button>
        )}
        <label className="block text-sm font-bold">
          1. Nội dung buổi học
          <textarea
            rows={6}
            maxLength={12000}
            className={input}
            value={value.content}
            onChange={(e) => change("content", e.target.value)}
            placeholder="Dán nội dung cố định của buổi học…"
          />
        </label>
        {!isTemplate && (
          <div>
            <label className="block text-sm font-bold">
              2. Nhận xét riêng từng học sinh
              <textarea
                rows={8}
                maxLength={30000}
                className={input}
                value={value.comments}
                onChange={(e) => change("comments", e.target.value)}
                placeholder={"Bảo đã làm tốt…\n\nThái đã chủ động…"}
              />
            </label>
            <p className="my-2 text-xs text-slate-500 dark:text-slate-400">
              Mỗi học sinh một đoạn, cách nhau một dòng trống. Bản sao chép tự
              thêm “-”, không thêm trùng.
            </p>
            <button
              type="button"
              className={button}
              onClick={() =>
                change("comments", normalizeComments(value.comments))
              }
            >
              Chuẩn hóa dấu “-”
            </button>
          </div>
        )}
        {hasHomework(value.subject) ? (
          <label className="block text-sm font-bold">
            {isTemplate ? "Bài tập về nhà" : "3. Bài tập về nhà"}
            <textarea
              rows={4}
              maxLength={12000}
              className={input}
              value={value.homework}
              onChange={(e) => change("homework", e.target.value)}
            />
          </label>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Học phần Robotics không có mục bài tập về nhà.
          </p>
        )}
        {!isTemplate && (
          <details open>
            <summary className="cursor-pointer text-sm font-bold">
              Xem trước nội dung sao chép
            </summary>
            <textarea
              aria-label="Nội dung sao chép"
              readOnly
              rows={10}
              className={input}
              value={output}
            />
          </details>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"
            onClick={() => save(value.status === "sent" ? "sent" : "draft")}
          >
            {busy ? "Đang lưu…" : isTemplate ? "Lưu mẫu" : "Lưu nhận xét"}
          </button>
          {!isTemplate && (
            <>
              <button type="button" className={button} onClick={copy}>
                Sao chép toàn bộ
              </button>
            </>
          )}
        </div>
        <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
          {message || (dirty ? "Có thay đổi chưa lưu." : "")}
        </p>
      </fieldset>
    </ModalShell>
  );
}
