import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import { uid } from "../../../utils/id";
import { validateCatalog } from "../subjectCatalog";

const newSubject = () => ({ id: `SUB_${uid()}`, code: "", name: "" });
const input = "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950";

export default function SubjectGroupEditor({ group, catalog, onSave, onClose }) {
  const [draft, setDraft] = useState(() => group ? structuredClone(group) : {
    id: uid(), name: "", category: "coding", subjects: [newSubject()],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  function change(next) {
    setDraft(next);
    setDirty(true);
    setError("");
  }
  function subjectChange(index, key, value) {
    change({ ...draft, subjects: draft.subjects.map((s, i) => i === index ? { ...s, [key]: value } : s) });
  }
  async function save() {
    if (busy) return;
    const next = {
      ...draft,
      name: draft.name.trim(),
      subjects: draft.subjects.map((s) => {
        const previous = group?.subjects.find((old) => old.id === s.id);
        const code = s.code.trim().toUpperCase();
        // Keep class-code inference working after a visible code is renamed.
        const aliases = [...new Set([
          ...(s.aliases || []),
          ...(previous && previous.code !== code ? [previous.code] : []),
        ])].filter((alias) => alias !== code);
        return { ...s, code, name: s.name.trim(), aliases };
      }),
    };
    try {
      validateCatalog(group ? catalog.map((g) => g.id === group.id ? next : g) : [...catalog, next]);
    } catch (e) {
      setError(e.message);
      return;
    }
    setBusy(true);
    try {
      if (await onSave(next, group?.updatedAt || 0)) onClose();
      else setError("Chưa lưu được. Kiểm tra thông báo lỗi rồi thử lại.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell
      title={group ? "Sửa bộ môn và học phần" : "Thêm bộ môn"}
      busy={busy}
      onClose={() => { if (!dirty || window.confirm("Bỏ thay đổi chưa lưu?")) onClose(); }}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <label className="block text-sm font-bold">
          Tên bộ môn
          <input maxLength={80} value={draft.name} onChange={(e) => change({ ...draft, name: e.target.value })} className={input} placeholder="Ví dụ: ARM" />
        </label>
        <label className="block text-sm font-bold">
          Nhóm
          <select value={draft.category} onChange={(e) => change({ ...draft, category: e.target.value })} className={input}>
            <option value="coding">Codings</option>
            <option value="robotics">Robotics (không có bài tập về nhà)</option>
          </select>
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sửa mã hoặc tên vẫn giữ mẫu và dữ liệu lớp đã liên kết. Mã cần duy nhất trong danh mục.
        </p>
        {draft.subjects.map((s, i) => (
          <div key={s.id} className="grid gap-2 rounded-xl bg-slate-100 p-3 sm:grid-cols-2 dark:bg-slate-800">
            <label className="text-xs font-bold">
              Mã học phần
              <input maxLength={16} value={s.code} onChange={(e) => subjectChange(i, "code", e.target.value.toUpperCase())} className={input} placeholder="ARMB" />
            </label>
            <label className="text-xs font-bold">
              Tên hiển thị (tùy chọn)
              <input maxLength={80} value={s.name} onChange={(e) => subjectChange(i, "name", e.target.value)} className={input} placeholder="Cơ bản" />
            </label>
          </div>
        ))}
        <button type="button" disabled={draft.subjects.length >= 30} className="text-sm font-bold text-brand-600 dark:text-brand-400" onClick={() => change({ ...draft, subjects: [...draft.subjects, newSubject()] })}>
          + Thêm học phần
        </button>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        <button type="button" onClick={save} className="block w-full rounded-xl bg-brand-600 p-3 text-sm font-bold text-white">
          {busy ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </fieldset>
    </ModalShell>
  );
}
