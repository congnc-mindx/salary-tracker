import { useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";

function money(value) {
  return Math.round(value).toLocaleString("vi-VN") + "đ";
}

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function SettingsPage({
  settings,
  currentTeacherRate,
  onAddSalaryRate,
}) {
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const rules = [
    {
      label: "Dạy bù",
      value: `${settings.makeUpRatio * 100}% lương GV / giờ`,
    },
    {
      label: "Giám khảo",
      value: `${money(settings.judgeRatePerSession)} / lịch`,
    },
    {
      label: "Trial ONL",
      value: `${money(settings.trialOnlineRatePerStudent)} × số học sinh`,
    },
    {
      label: "Trial OFF",
      value: `${money(settings.trialOfflineBaseRate)} + ${money(
        settings.trialOfflineBonusPerStudent
      )} × số học sinh`,
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-2xl font-black">Cài đặt</h2>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Mức lương hiện tại */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-500">
            Lương giáo viên hiện tại
          </p>

          <p className="mt-2 text-3xl font-black text-blue-700">
            {money(currentTeacherRate)}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {money(currentTeacherRate / 2)} / giờ
          </p>

          <button
            type="button"
            onClick={() => setShowSalaryModal(true)}
            className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700"
          >
            Cập nhật mức lương
          </button>
        </div>

        {/* Quy tắc tính thu nhập */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-500">Quy tắc tính</p>

          <div className="mt-4 space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.label}
                className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0"
              >
                <p className="font-bold text-slate-600">
                  {rule.label}
                </p>

                <p className="text-right font-black">
                  {rule.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSalaryModal && (
        <SalaryRateModal
          currentRate={currentTeacherRate}
          onClose={() => setShowSalaryModal(false)}
          onSave={onAddSalaryRate}
        />
      )}
    </section>
  );
}

function SalaryRateModal({ currentRate, onClose, onSave }) {
  const dialogRef = useRef(null);
  const savingRef = useRef(false);

  const [rate, setRate] = useState(String(currentRate));
  const [date, setDate] = useState(todayLocal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (savingRef.current) return;

    const parsedRate = Number(rate);

    if (!Number.isSafeInteger(parsedRate) || parsedRate <= 0) {
      setError("Vui lòng nhập mức lương là số nguyên lớn hơn 0.");
      return;
    }

    if (!date) {
      setError("Vui lòng chọn ngày áp dụng.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError("");

    try {
      await onSave(parsedRate, date);
    } catch {
      setError("Chưa lưu được mức lương. Vui lòng thử lại.");
      savingRef.current = false;
      setSaving(false);
      return;
    }

    savingRef.current = false;
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="salary-modal-title"
      onCancel={(event) => {
        event.preventDefault();

        if (!savingRef.current) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-24px)] max-w-xl overflow-y-auto rounded-3xl border-0 bg-[#f5f8fc] p-5 text-slate-950 shadow-2xl backdrop:bg-slate-950/40"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3
          id="salary-modal-title"
          className="text-2xl font-black"
        >
          Cập nhật mức lương
        </h3>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Đóng cập nhật mức lương"
          className="rounded-full bg-white p-2 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-busy={saving}
      >
        <label className="block">
          <span className="mb-2 block font-black text-slate-700">
            Lương GV / ca 2 tiếng
          </span>

          <input
            type="number"
            min="1"
            step="1"
            required
            autoFocus
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            disabled={saving}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-black text-slate-700">
            Áp dụng từ ngày
          </span>

          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={saving}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-500"
          />
        </label>

        <div className="rounded-3xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
          Các buổi trước ngày áp dụng vẫn dùng mức cũ.
          Từ ngày này trở đi dùng mức mới.
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Đang lưu…" : "Lưu mức lương"}
        </button>
      </form>
    </dialog>
  );
}