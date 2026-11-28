import Button from "../../../components/common/Button";
import { confirmAction, notify } from "../../../components/common/feedback";
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
  field,
}) {
  const [value, setValue] = useState(() => ({
    ...EMPTY_REVIEW,
    ...initialValue,
  }));
  const [baseline, setBaseline] = useState(() => fingerprint(initialValue));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = fingerprint(value) !== baseline;
  async function close() {
    if (busy) return;
    if (dirty && !await confirmAction("Bỏ các thay đổi chưa lưu?")) return;
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
        notify(isTemplate ? "Đã lưu mẫu." : "Đã lưu nháp.");
        onClose();
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
      notify("Đã sao chép.");
    } catch {
      setMessage(
        "Trình duyệt chưa cho phép sao chép. Bạn có thể chọn nội dung trong ô để sao chép thủ công.",
      );
    }
  }
  const button =
    "min-h-11 rounded-xl border border-sky-600/30 bg-sky-50 text-sky-800 hover:bg-sky-100 whitespace-nowrap px-3 py-2 text-sm font-bold disabled:opacity-40 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900";
  return (
    <ModalShell
      wide={!isTemplate}
      headerRight={
        <div className="flex flex-wrap items-center gap-2">
        <Button variant="reviewSave" disabled={busy} onClick={save}>{isTemplate ? "Lưu mẫu" : "Lưu nháp"}</Button>
        {!isTemplate && (
          <fieldset
            disabled={busy}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            aria-label="Thao tác nhận xét"
          >
            <button
              type="button"
              className={button}
              disabled={!template}
              onClick={async () => {
                if (
                  reviewText(value) &&
                  !await confirmAction(
                    "Thay nội dung đang hiển thị bằng mẫu hiện tại?",
                  )
                )
                  return;
                setValue({ ...EMPTY_REVIEW, ...template });
                notify("Đã lấy mẫu. Bấm Lưu nháp để giữ bản mới.");
              }}
            >
              Lấy mẫu
            </button>
            <button
              type="button"
              className={button}
              disabled={!value.learning.trim()}
              onClick={() => copy(value.learning.trim())}
            >
              Chép kiến thức
            </button>
            <button
              type="button"
              className={button}
              disabled={!value.recommendation.trim()}
              onClick={() => copy(value.recommendation.trim())}
            >
              Chép đề xuất
            </button>
            <button
              type="button"
              className={button}
              disabled={!reviewText(value)}
              onClick={() => copy(reviewText(value))}
            >
              Chép cả hai
            </button>
          </fieldset>
        )}
        </div>
      }
      busy={busy}
      footer={message ? <p role="status" className="text-sm">{message}</p> : null}
      title={title}
      onClose={close}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <ReviewFields compact={isTemplate} field={isTemplate ? field : undefined} value={value} onChange={setValue} />
      </fieldset>
    </ModalShell>
  );
}
