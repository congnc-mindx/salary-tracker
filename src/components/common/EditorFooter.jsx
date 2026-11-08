import Button from "./Button";

export default function EditorFooter({ busy, onSave, label = "Lưu nháp", message, dirty }) {
  return <div className="flex flex-wrap items-center justify-between gap-3">
    <p role="status" aria-live="polite" className="min-w-0 flex-1 text-sm text-slate-600 dark:text-slate-300">
      {message || (dirty ? "Có thay đổi chưa lưu." : "")}
    </p>
    <Button variant="primary" disabled={busy} onClick={onSave}>{busy ? "Đang lưu…" : label}</Button>
  </div>;
}
