import EditorFooter from "../../../components/common/EditorFooter";
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
      setMessage("Đã sao chép.");
    } catch {
      setMessage(
        "Trình duyệt chưa cho phép sao chép. Bạn có thể chọn nội dung trong ô để sao chép thủ công.",
      );
    }
  }
  const button =
    "min-h-11 rounded-xl bg-slate-100 whitespace-nowrap px-2 py-2 text-xs font-bold disabled:opacity-40 dark:bg-slate-800";
  return (
    <ModalShell
      wide
      toolbar={
        !isTemplate && (
          <fieldset
            disabled={busy}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            aria-label="Thao tác nhận xét"
          >
            <button
              type="button"
              className={button}
              disabled={!template}
              onClick={() => {
                if (
                  reviewText(value) &&
                  !window.confirm(
                    "Thay nội dung đang hiển thị bằng mẫu hiện tại?",
                  )
                )
                  return;
                setValue({ ...EMPTY_REVIEW, ...template });
                setMessage("Đã lấy mẫu. Bấm Lưu nháp để giữ bản mới.");
              }}
            >
              Lấy lại mẫu
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
        )
      }
      busy={busy}
      footer={
        <EditorFooter
          busy={busy}
          onSave={save}
          label={isTemplate ? "Lưu mẫu" : "Lưu nháp"}
          message={message}
          dirty={dirty}
        />
      }
      title={title}
      description={
        isTemplate
          ? "Mẫu dùng chung theo học phần. Không thay đổi nhận xét đã lưu của lớp."
          : "Có thể chỉnh riêng cho lớp trước khi sao chép. Lưu nháp để giữ bản này; tích Hoàn thành ngoài thẻ khi đã lấy nhận xét."
      }
      onClose={close}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <ReviewFields value={value} onChange={setValue} />
      </fieldset>
    </ModalShell>
  );
}
