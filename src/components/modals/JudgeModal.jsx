import { useRef, useState } from "react";
import { Save } from "lucide-react";

import ModalShell from "../common/ModalShell";
import Field from "../common/Field";
import SelectField from "../common/SelectField";
import DatePicker from "../common/DatePicker";
import TimeSelect from "../common/TimeSelect";

import {
  todayISO,
  dateFromDateTime,
  timeFromDateTime,
  toISO,
  addHoursToTime,
} from "../../utils/date";
import { mergeCampuses } from "../../utils/campuses";
import { money } from "../../utils/format";
import { validateTeachingExtra } from "../../utils/extra";
import { getDefaultStatusByDate, getExtraAmount } from "../../services/income";

const timeOptions = Array.from({ length: 29 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;

  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;
});

function shiftMonth(date, amount) {
  const next = new Date(date);
  const day = next.getDate();

  next.setDate(1);
  next.setMonth(next.getMonth() + amount);

  const lastDay = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate();

  next.setDate(Math.min(day, lastDay));

  return toISO(next);
}

export default function JudgeModal({
  extra = null,
  campuses = [],
  settings,
  onClose,
  onSave,
}) {
  const initialDate = extra ? dateFromDateTime(extra.datetime) : "";

  const initialTime = extra ? timeFromDateTime(extra.datetime) : "";

  const [classCode, setClassCode] = useState(extra?.classCode ?? "");
  const [campus, setCampus] = useState(extra?.campus ?? "");
  const [date, setDate] = useState(initialDate || todayISO());
  const [startTime, setStartTime] = useState(initialTime);
  const [note, setNote] = useState(extra?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const busyRef = useRef(false);

  const availableCampuses = mergeCampuses([...campuses, extra?.campus ?? ""]);

  const availableTimes =
    initialTime && !timeOptions.includes(initialTime)
      ? [...timeOptions, initialTime].sort()
      : timeOptions;

  const minDate = shiftMonth(new Date(), -1);
  const maxDate = shiftMonth(new Date(), 1);

  // Cho phép hiển thị ngày của lịch cũ khi chỉnh sửa.
  const pickerMin =
    initialDate && initialDate < minDate ? initialDate : minDate;

  const pickerMax =
    initialDate && initialDate > maxDate ? initialDate : maxDate;

  const endTime = startTime ? addHoursToTime(startTime, 2) : "";

  const endsNextDay =
    startTime &&
    Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3, 5)) + 120 >=
      1440;

  // Dùng cùng công thức với trang thống kê.
  const estimatedAmount = getExtraAmount(
    {
      type: "judge",
      datetime: `${date}T${startTime || "08:00"}`,
      hours: 2,
      status: "planned",
    },
    settings,
  );

  async function submit() {
    if (busyRef.current) return;

    setError("");

    const values = {
      type: "judge",
      classCode: classCode.trim().toUpperCase(),
      campus,
      datetime: `${date}T${startTime}`,
      hours: 2,
      status: extra?.status ?? getDefaultStatusByDate(date),
      note: note.trim(),
    };

    const validation = validateTeachingExtra(values);

    if (validation) {
      setError(validation);
      return;
    }

    if (!availableCampuses.includes(campus)) {
      setError("Bạn hãy chọn cơ sở trong danh sách.");
      return;
    }

    const now = new Date();
    const unchangedDate = Boolean(extra) && date === initialDate;

    if (
      !unchangedDate &&
      (date < shiftMonth(now, -1) || date > shiftMonth(now, 1))
    ) {
      setError("Ngày chấm chỉ được trong 1 tháng trước đến 1 tháng tới.");
      return;
    }

    if (!availableTimes.includes(startTime)) {
      setError("Bạn hãy chọn giờ bắt đầu hợp lệ.");
      return;
    }

    busyRef.current = true;
    setSaving(true);

    try {
      const success = await onSave(values, extra?.id);

      if (success === false) {
        setError(
          "Chưa lưu được lịch. Hãy kiểm tra thông báo lỗi hoặc lịch trùng.",
        );
      }
    } catch {
      setError("Không lưu được lịch. Bạn hãy thử lại.");
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={extra ? "Chỉnh sửa lịch giám khảo" : "Đặt lịch giám khảo"}
      onClose={onClose}
    >
      <fieldset disabled={saving} className="min-w-0 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Mã lớp"
            value={classCode}
            onChange={setClassCode}
            placeholder="VD: GA71"
          />

          <SelectField
            label="Cơ sở"
            value={campus}
            onChange={setCampus}
            options={[
              {
                value: "",
                label: "Chọn cơ sở",
                disabled: true,
              },
              ...availableCampuses.map((name) => ({
                value: name,
                label: name,
              })),
            ]}
          />
        </div>

        {availableCampuses.length === 0 && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Hãy thêm cơ sở trong trang Cài đặt trước.
          </p>
        )}

        <DatePicker
          label="Ngày chấm"
          value={date}
          onChange={setDate}
          min={pickerMin}
          max={pickerMax}
        />

        <TimeSelect
          label="Giờ bắt đầu"
          value={startTime}
          onChange={setStartTime}
          options={availableTimes}
          placeholder="Chọn giờ bắt đầu"
        />

        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {startTime
            ? `Ca chấm: ${startTime} – ${endTime}${
                endsNextDay ? " ngày kế tiếp" : ""
              } · 2 giờ`
            : "Mỗi ca giám khảo kéo dài 2 giờ."}
        </p>

        <Field
          label="Ghi chú"
          value={note}
          onChange={setNote}
          placeholder="Nhập ghi chú nếu có"
        />

        <div className="rounded-3xl bg-brand-50 p-4 text-sm font-black text-brand-800 dark:bg-brand-950 dark:text-brand-200">
          Lương dự kiến: {money(estimatedAmount)}
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
          type="button"
          onClick={submit}
          disabled={saving || availableCampuses.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-4 font-black text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <Save size={18} />

          {saving ? "Đang lưu..." : extra ? "Lưu thay đổi" : "Lưu lịch"}
        </button>
      </fieldset>
    </ModalShell>
  );
}
