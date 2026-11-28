import { confirmAction } from "../../../components/common/feedback";
import {fixedLevels,LEVELS} from "../subjectLevels";
import SharedSelect from "../../../components/common/SharedSelect";
import { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import { uid } from "../../../utils/id";
import { validateCatalog, subjectLevel } from "../subjectCatalog";


const input =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950";

export default function SubjectGroupEditor({
  group,
  catalog,
  onSave,
  onClose,
}) {
  const [draft, setDraft] = useState(() =>
    group
      ? {...structuredClone(group), subjects:fixedLevels(group.subjects,()=>`SUB_${uid()}`)}
      : {
          id: uid(),
          name: "",
          category: "coding",
          subjects: fixedLevels([],()=>`SUB_${uid()}`),
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  function change(next) {
    setDraft(next);
    setDirty(true);
    setError("");
  }
  function subjectChange(index, key, value) {
    change({
      ...draft,
      subjects: draft.subjects.map((s, i) =>
        i === index ? { ...s, [key]: value } : s,
      ),
    });
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
        const aliases = [
          ...new Set([
            ...(s.aliases || []),
            ...(previous && previous.code !== code ? [previous.code] : []),
          ]),
        ].filter((alias) => alias !== code);
        return { ...s, code, name: subjectLevel(code) || s.name.trim(), aliases };
      }),
    };
    try {
      if(next.subjects.some((s,i)=>!s.code.endsWith(LEVELS[i][0]) && s.code!==group?.subjects.find(old=>old.id===s.id)?.code)) throw Error("Mã học phần cần kết thúc bằng B, A, I tương ứng với ba level.");
      validateCatalog(
        group
          ? catalog.map((g) => (g.id === group.id ? next : g))
          : [...catalog, next],
      );
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

      footer={
        <div className="space-y-2">
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="min-h-11 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      }
      onClose={async () => {
        if (!dirty || await confirmAction("Bỏ thay đổi chưa lưu?")) onClose();
      }}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <label className="block text-sm font-bold">
          Tên bộ môn
          <input
            maxLength={80}
            value={draft.name}
            onChange={(e) => change({ ...draft, name: e.target.value })}
            className={input}
            placeholder="Ví dụ: ARM"
          />
        </label>
        <label className="block text-sm font-bold">
          Nhóm
          <SharedSelect
            value={draft.category}
            onChange={(e) => change({ ...draft, category: e.target.value })}
            className={input}
          >
            <option value="coding">Codings</option>
            <option value="robotics">Robotics</option>
          </SharedSelect>
        </label>
        <div className="grid grid-cols-3 gap-2">
        {draft.subjects.map((s,i)=><label key={s.id} className="min-w-0 text-xs font-bold">{LEVELS[i][1]}<input maxLength={16} value={s.code} onChange={e=>subjectChange(i,"code",e.target.value.toUpperCase())} className={input} placeholder={`Mã …${LEVELS[i][0]}`} aria-label={`Mã ${LEVELS[i][1]}`}/></label>)}
        </div>
      </fieldset>
    </ModalShell>
  );
}
