import Button from "../../../components/common/Button";
import EditorFooter from "../../../components/common/EditorFooter";
import { useSubjectCatalog } from "../SubjectCatalogContext";
import { subjectLabel } from "../subjectCatalog";
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
  const catalog = useSubjectCatalog();
  const [value, setValue] = useState(() =>
    createSessionDraft(saved, template, subject, catalog),
  );
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(createSessionDraft(saved, template, subject, catalog)),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pane, setPane] = useState("edit");
  const dirty = JSON.stringify(value) !== baseline;
  const output = buildSessionReview(value, sessionNo, total, catalog);
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
  const input =
    "mt-2 block w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal leading-6 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
  function reloadTemplate() {
    if (
      !window.confirm(
        "Lấy lại nội dung và bài tập từ mẫu? Nhận xét học sinh được giữ nguyên.",
      )
    )
      return;
    const fresh = createSessionDraft(null, template, subject, catalog);
    setValue((v) => ({
      ...v,
      content: fresh.content,
      homework: fresh.homework,
      subject,
      status: "draft",
    }));
    setMessage("Đã lấy mẫu. Lưu nháp để giữ thay đổi.");
  }
  const field = (key, label, rows, maxLength, placeholder) => (
    <label className="block text-sm font-bold">
      {label}
      <textarea
        aria-label={label}
        rows={rows}
        maxLength={maxLength}
        className={input}
        value={value[key]}
        onChange={(e) => change(key, e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
  return (
    <ModalShell
      wide
      title={title}
      busy={busy}
      description={`Buổi ${sessionNo}/${total} · ${subjectLabel(value.subject, catalog) || "Chưa chọn học phần"}`}
      onClose={() => {
        if (!busy && (!dirty || window.confirm("Bỏ các thay đổi chưa lưu?")))
          onClose();
      }}
      toolbar={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {!isTemplate && (
              <Button disabled={busy || !template} onClick={reloadTemplate}>
                Lấy lại mẫu
              </Button>
            )}
            {!isTemplate && (
              <Button
                variant="primary"
                disabled={busy || !value.content.trim()}
                onClick={copy}
              >
                Sao chép toàn bộ
              </Button>
            )}
          </div>
          {!isTemplate && (
            <div
              className="flex rounded-xl bg-slate-200 p-1 lg:hidden dark:bg-slate-800"
              aria-label="Chế độ nhận xét"
            >
              {[
                ["edit", "Soạn"],
                ["preview", "Xem trước"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={pane === key}
                  onClick={() => setPane(key)}
                  className={
                    "rounded-lg px-3 py-2 text-xs font-bold " +
                    (pane === key ? "bg-white shadow-sm dark:bg-slate-700" : "")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      }
      footer={
        <EditorFooter
          busy={busy}
          onSave={() => save(value.status === "sent" ? "sent" : "draft")}
          label={isTemplate ? "Lưu mẫu" : "Lưu nháp"}
          message={message}
          dirty={dirty}
        />
      }
    >
      <fieldset
        disabled={busy}
        className={
          "min-w-0 pt-4 " +
          (!isTemplate ? "lg:grid lg:grid-cols-2 lg:gap-6" : "")
        }
      >
        <div
          className={
            (pane === "preview" && !isTemplate ? "hidden lg:block " : "") +
            "min-w-0 space-y-4 lg:max-h-[55dvh] lg:overflow-y-auto lg:pr-2"
          }
        >
          {!isTemplate && (
            <div className="rounded-2xl border border-brand-200 bg-white p-4 dark:border-brand-900 dark:bg-slate-900">
              {field(
                "comments",
                "Nhận xét học sinh",
                9,
                30000,
                "Bảo đã làm tốt…\n\nThái đã chủ động…",
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mỗi bạn một đoạn. Khi chép, tự thêm dấu “-”.
                </p>
                <Button
                  onClick={() =>
                    change("comments", normalizeComments(value.comments))
                  }
                  className="text-xs"
                >
                  Chuẩn hóa dấu “-”
                </Button>
              </div>
            </div>
          )}
          <details
            open={isTemplate || (!saved?.content && !template?.content)}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <summary className="cursor-pointer text-sm font-bold">
              Nội dung buổi học{" "}
              <span className="font-normal text-slate-500">
                · {value.content.trim() ? "Có nội dung" : "Cần bổ sung"}
              </span>
            </summary>
            <div className="mt-3">
              {field(
                "content",
                "Nội dung",
                6,
                12000,
                "Dán nội dung cố định của buổi học…",
              )}
            </div>
          </details>
          {hasHomework(value.subject, catalog) ? (
            <details
              open={isTemplate}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <summary className="cursor-pointer text-sm font-bold">
                Bài tập về nhà
              </summary>
              <div className="mt-3">
                {field("homework", "Bài tập", 4, 12000, "Nhập bài tập về nhà…")}
              </div>
            </details>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Học phần Robotics không có bài tập về nhà.
            </p>
          )}
        </div>
        {!isTemplate && (
          <div
            className={
              (pane === "edit" ? "hidden lg:flex " : "flex ") +
              "min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
            }
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-black">Bản gửi phụ huynh</h3>
              <span className="text-[11px] text-slate-400">
                Cập nhật khi bạn nhập
              </span>
            </div>
            <textarea
              readOnly
              aria-label="Nội dung sao chép"
              value={output}
              className="h-[45dvh] min-h-60 w-full flex-1 resize-none border-0 bg-transparent text-sm leading-7 outline-none focus:ring-2 focus:ring-brand-500"
            />
            {!value.comments.trim() && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                Chưa có nhận xét riêng của học sinh.
              </p>
            )}
          </div>
        )}
      </fieldset>
    </ModalShell>
  );
}
