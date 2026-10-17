import { useRef, useState } from "react";
import { Save } from "lucide-react";

import ModalShell from "../common/ModalShell";
import Field from "../common/Field";
import SelectField from "../common/SelectField";
import DatePicker from "../common/DatePicker";
import TimeSelect from "../common/TimeSelect";

import { todayISO } from "../../utils/date";
import { mergeCampuses } from "../../utils/campuses";
import { money } from "../../utils/format";

import { extraTypeLabel, validateTeachingExtra } from "../../utils/extra";

import { getDefaultStatusByDate, getExtraAmount } from "../../services/income";

const times = Array.from({ length: 29 }, (_, index) => {
  const minutes = 480 + index * 30;

  const time = `${String(Math.floor(minutes / 60)).padStart(
    2,
    "0",
  )}:${String(minutes % 60).padStart(2, "0")}`;

  return { value: time, label: time };
});

export default function SingleTeachingModal({
  type,
  extra = null,
  campuses = [],
  settings,
  onClose,
  onSave,
}) {
  const trial = type === "trial";

  const [classCode, setClassCode] = useState(extra?.classCode ?? "");
  const [campus, setCampus] = useState(extra?.campus ?? "");

  const [date, setDate] = useState(
    () => extra?.datetime?.slice(0, 10) || todayISO(),
  );
  const [startTime, setStartTime] = useState(
    extra?.datetime?.slice(11, 16) || "",
  );

  const [hours, setHours] = useState(String(extra?.hours ?? 1));
  const [studentCount, setStudentCount] = useState(
    String(extra?.studentCount ?? 1),
  );
  const [trialMode, setTrialMode] = useState(extra?.trialMode ?? "ONL");

  const [note, setNote] = useState(extra?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  const availableCampuses = mergeCampuses(campuses, [extra?.campus]);

  const online = trial && trialMode === "ONL";

  // Cho phép giữ giờ của bản ghi cũ nếu không thuộc các mốc mới.
  const oldTime = extra?.datetime?.slice(11, 16);

  const options =
    oldTime && !times.some((item) => item.value === oldTime)
      ? [
          ...times,
          {
            value: oldTime,
            label: `${oldTime} (giờ đã lưu)`,
          },
        ]
      : times;

  const values = {
    type,
    classCode: trial ? "" : classCode.trim().toUpperCase(),
    campus: online ? "" : campus,
    datetime: `${date}T${startTime}`,
    hours: trial ? Number(hours) : 2,
    studentCount: trial ? Number(studentCount) : undefined,
    trialMode: trial ? trialMode : undefined,
    status: extra?.status ?? getDefaultStatusByDate(date),
    note: note.trim(),
  };

  const validation = validateTeachingExtra(values);

  const estimate = validation ? null : getExtraAmount(values, settings);

  async function submit(event) {
    event.preventDefault();

    if (busy.current) return;

    const message =
      validation ||
      (!online && !availableCampuses.includes(campus)
        ? "Bạn hãy chọn cơ sở trong danh sách."
        : "");

    setError(message);

    if (message) return;

    busy.current = true;
    setSaving(true);

    try {
      await onSave(values, extra?.id);
    } catch {
      setError("Không thể lưu lịch. Bạn hãy thử lại.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={`${extra ? "Chỉnh sửa" : "Book lịch"} ${extraTypeLabel(
        type,
      ).toLowerCase()}`}
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {trial ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Hình thức"
                value={trialMode}
                onChange={setTrialMode}
                options={[
                  { value: "ONL", label: "Online" },
                  { value: "OFF", label: "Offline" },
                ]}
              />

              <DatePicker label="Ngày dạy" value={date} onChange={setDate} />
            </div>

            {!online && (
              <SelectField
                label="Cơ sở"
                value={campus}
                onChange={setCampus}
                placeholder="Chọn cơ sở"
                options={availableCampuses.map((name) => ({
                  value: name,
                  label: name,
                }))}
              />
            )}
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Mã lớp"
                value={classCode}
                onChange={setClassCode}
                placeholder="VD: SA55"
              />

              <SelectField
                label="Cơ sở"
                value={campus}
                onChange={setCampus}
                placeholder="Chọn cơ sở"
                options={availableCampuses.map((name) => ({
                  value: name,
                  label: name,
                }))}
              />
            </div>

            <DatePicker label="Ngày dạy" value={date} onChange={setDate} />
          </>
        )}

        <TimeSelect
          label="Giờ bắt đầu"
          value={startTime}
          onChange={setStartTime}
          options={options}
        />

        {trial ? (
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Số giờ"
              type="number"
              min={0.5}
              step={0.5}
              value={hours}
              onChange={setHours}
              placeholder="VD: 1"
            />

            <Field
              label="Số học sinh"
              type="number"
              min={1}
              step={1}
              value={studentCount}
              onChange={setStudentCount}
              placeholder="VD: 1"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thời lượng: 2 giờ / buổi.
          </p>
        )}

        <Field
          label="Ghi chú"
          value={note}
          onChange={setNote}
          placeholder="Nhập nội dung hoặc ghi chú nếu có"
        />

        <div
          className="
            rounded-3xl bg-brand-50 p-4
            text-sm font-black text-brand-800
            dark:bg-brand-950 dark:text-brand-200
          "
        >
          Lương dự kiến: {estimate === null ? "—" : money(estimate)}
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm font-semibold text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="
            flex w-full items-center justify-center gap-2
            rounded-2xl bg-brand-600 px-4 py-4
            font-black text-white hover:bg-brand-hover
            disabled:opacity-50
           transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <Save size={18} />

          {saving ? "Đang lưu…" : extra ? "Lưu thay đổi" : "Lưu lịch"}
        </button>
      </form>
    </ModalShell>
  );
}
