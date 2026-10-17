import { useState } from "react";

import ModalShell from "../../components/common/ModalShell";

export default function CampusSettings({
  campuses = [],
  onAddCampus,
  onClose,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function closeModal() {
    if (isSaving) return;
    onClose();
  }

  async function submit(event) {
    event.preventDefault();

    if (isSaving) return;

    const cleanName = name.trim().replace(/\s+/g, " ");

    if (!cleanName) {
      setError("Bạn hãy nhập tên cơ sở.");
      return;
    }

    const exists = campuses.some(
      (campus) =>
        campus.trim().toLocaleLowerCase("vi-VN") ===
        cleanName.toLocaleLowerCase("vi-VN"),
    );

    if (exists) {
      setError("Cơ sở này đã có trong danh sách.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const success = await onAddCampus(cleanName);

      if (!success) {
        setError("Chưa thể thêm cơ sở. Bạn vui lòng thử lại.");
        return;
      }

      onClose();
    } catch {
      setError("Không thể lưu cơ sở. Bạn kiểm tra kết nối rồi thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <ModalShell
        title="Thêm cơ sở"
        description="Cơ sở mới sẽ xuất hiện trong danh sách chọn khi book lịch."
        onClose={closeModal}
      >
        {campuses.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Cơ sở hiện có
            </p>

            <div className="flex flex-wrap gap-2">
              {campuses.map((campus) => (
                <span
                  key={campus}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {campus}
                </span>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label
              htmlFor="campus-name"
              className="mb-2 block text-sm font-bold"
            >
              Tên cơ sở
            </label>

            <input
              id="campus-name"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Ví dụ: Ocean Park"
              required
              maxLength={100}
              disabled={isSaving}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "campus-error" : undefined}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            {error && (
              <p
                id="campus-error"
                role="alert"
                className="mt-2 text-sm text-rose-600 dark:text-rose-400"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Đóng
            </button>

            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="min-h-11 rounded-2xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              {isSaving ? "Đang lưu..." : "Thêm cơ sở"}
            </button>
          </div>
        </form>
      </ModalShell>
    </>
  );
}
