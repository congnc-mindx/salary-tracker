import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import ReviewFields from "./ReviewFields";
import { EMPTY_REVIEW, reviewText } from "../reviewsModel";

const fingerprint = (value = EMPTY_REVIEW) =>
  JSON.stringify([value.learning || "", value.recommendation || ""]);

export default function FinalReviewEditor({
  title,
  initialValue,
  template,
  onSave,
  onClose,
  isTemplate = false,
}) {
  const [value, setValue] = useState(() => ({
    ...EMPTY_REVIEW,
    ...initialValue,
  }));
  const [baseline, setBaseline] = useState(() => fingerprint(initialValue));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = fingerprint(value) !== baseline;
  function close() {
    if (busy) return;
    if (dirty && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
    onClose();
  }
  async function save() {
    if (busy) return;
    if (!reviewText(value)) {
      setMessage("Hãy nhập ít nhất một phần nội dung.");
      return;
    }
    setBusy(true);
    try {
      const success = await onSave({
        learning: value.learning.trim(),
        recommendation: value.recommendation.trim(),
      });
      if (success) {
        setBaseline(fingerprint(value));
        setMessage("Đã lưu.");
      } else setMessage("Chưa lưu được. Nội dung đang nhập vẫn được giữ lại.");
    } catch {
      setMessage("Chưa lưu được. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Đã sao chép.");
    } catch {
      setMessage(
        "Trình duyệt chưa cho phép sao chép. Bạn có thể chọn nội dung trong ô để sao chép thủ công.",
      );
    }
  }
  const button =
    "rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold disabled:opacity-40 dark:bg-slate-800";
  return (
    <ModalShell
      busy={busy}
      title={title}
      description={
        isTemplate
          ? "Mẫu dùng chung theo học phần. Không thay đổi nhận xét đã lưu của lớp."
          : "Có thể chỉnh riêng cho lớp trước khi sao chép. Lưu để giữ lại bản này."
      }
      onClose={close}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        {!isTemplate && template && (
          <button
            type="button"
            className={button}
            onClick={() => {
              if (
                reviewText(value) &&
                !window.confirm(
                  "Thay nội dung đang hiển thị bằng mẫu hiện tại?",
                )
              )
                return;
              setValue({ ...EMPTY_REVIEW, ...template });
              setMessage("Đã lấy mẫu. Bấm Lưu để giữ bản mới.");
            }}
          >
            Lấy lại từ mẫu
          </button>
        )}
        <ReviewFields value={value} onChange={setValue} />
        <div className="flex flex-wrap gap-2">
          {!isTemplate && (
            <>
              <button
                type="button"
                className={button}
                disabled={!value.learning.trim()}
                onClick={() => copy(value.learning.trim())}
              >
                Sao chép kiến thức
              </button>
              <button
                type="button"
                className={button}
                disabled={!value.recommendation.trim()}
                onClick={() => copy(value.recommendation.trim())}
              >
                Sao chép đề xuất
              </button>
              <button
                type="button"
                className={button}
                disabled={!reviewText(value)}
                onClick={() => copy(reviewText(value))}
              >
                Sao chép cả hai
              </button>
            </>
          )}
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {busy ? "Đang lưu…" : "Lưu nội dung"}
          </button>
        </div>
        <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
          {message || (dirty ? "Có thay đổi chưa lưu." : "")}
        </p>
      </fieldset>
    </ModalShell>
  );
}
