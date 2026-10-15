import { useState } from "react";
import { Plus } from "lucide-react";

export default function CampusSettings({ campuses, onAddCampus }) {
  const [name, setName] = useState("");

  async function submit(event) {
    event.preventDefault();

    const success = await onAddCampus(name);

    if (success) {
      setName("");
    }
  }

  return (
    <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-black">Cơ sở giảng dạy</h3>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Các cơ sở này sẽ xuất hiện trong danh sách chọn khi thêm lớp.
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Tên cơ sở mới"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nhập tên cơ sở"
          required
          maxLength={100}
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
        >
          <Plus size={18} />
          Thêm cơ sở
        </button>
      </form>

      {campuses.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {campuses.map((campus) => (
            <li
              key={campus}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {campus}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Chưa có cơ sở. Thêm cơ sở đầu tiên để bắt đầu tạo lớp.
        </p>
      )}
    </section>
  );
}
