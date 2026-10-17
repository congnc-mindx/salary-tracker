import { useRef, useState } from "react";
import { Save } from "lucide-react";

import ModalShell from "../common/ModalShell";
import Field from "../common/Field";
import SelectField from "../common/SelectField";
import DatePicker from "../common/DatePicker";
import TimeSelect from "../common/TimeSelect";

import { todayISO, parseDate, toISO, addHoursToTime } from "../../utils/date";

import { mergeCampuses } from "../../utils/campuses";
import { money } from "../../utils/format";

import { getDefaultStatusByDate, getExtraAmount } from "../../services/income";

const timeOptions = Array.from({ length: 29 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;

  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");

  const minute = String(totalMinutes % 60).padStart(2, "0");

  const time = `${hour}:${minute}`;

  return {
    label: time,
    value: time,
  };
});

export default function MakeupModal({
  extra = null,
  campuses = [],
  settings,
  onClose,
  onSave,
}) {
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

  const [note, setNote] = useState(extra?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const busyRef = useRef(false);

  const availableCampuses = mergeCampuses(campuses, [extra?.campus]);

  const parsedHours = Number(hours);
  const parsedStudentCount = Number(studentCount);

  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date) && toISO(parseDate(date)) === date;

  const validTime = timeOptions.some((option) => option.value === startTime);

  const validHours =
    hours !== "" &&
    Number.isInteger(parsedHours) &&
    parsedHours >= 1 &&
    parsedHours <= 5;

  const validStudentCount =
    studentCount !== "" &&
    Number.isInteger(parsedStudentCount) &&
    parsedStudentCount >= 1 &&
    parsedStudentCount <= 5;

  const preview = {
    type: "makeup",
    datetime: `${date}T${startTime || "00:00"}`,
    hours: parsedHours,
    status: "planned",
  };

  const showEstimate = validDate && validHours;

  const estimate = showEstimate ? getExtraAmount(preview, settings) : 0;

  let endTime = "";
  let endsNextDay = false;

  if (validTime && validHours) {
    const [hour, minute] = startTime.split(":").map(Number);

    endTime = addHoursToTime(startTime, parsedHours);

    endsNextDay = hour * 60 + minute + parsedHours * 60 >= 1440;
  }

  function change(setter) {
    return (value) => {
      setter(value);
      setError("");
    };
  }

  async function submit(event) {
    event.preventDefault();

    if (busyRef.current) return;

    setError("");

    const code = classCode.trim().toUpperCase();

    if (!code) {
      setError("Bạn hãy nhập mã lớp.");
      return;
    }

    if (!availableCampuses.includes(campus)) {
      setError("Bạn hãy chọn cơ sở trong danh sách.");
      return;
    }

    if (!validDate) {
      setError("Bạn hãy chọn ngày dạy bù hợp lệ.");
      return;
    }

    if (!validTime) {
      setError("Bạn hãy chọn giờ bắt đầu.");
      return;
    }

    if (!validHours) {
      setError("Số giờ dạy bù phải là số nguyên từ 1 đến 5.");
      return;
    }

    if (!validStudentCount) {
      setError("Số học sinh phải là số nguyên từ 1 đến 5.");
      return;
    }

    busyRef.current = true;
    setSaving(true);

    try {
      await onSave(
        {
          type: "makeup",
          classCode: code,
          campus,
          datetime: `${date}T${startTime}`,
          hours: parsedHours,
          studentCount: parsedStudentCount,
          status: extra?.status ?? getDefaultStatusByDate(date),
          note: note.trim(),
        },
        extra?.id,
      );
    } catch {
      setError("Không thể lưu lịch. Bạn hãy thử lại.");
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={extra ? "Chỉnh sửa lịch dạy bù" : "Book lịch dạy bù"}
      description="Mỗi ca tối đa 5 giờ và 5 học sinh."
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Mã lớp"
            value={classCode}
            onChange={change(setClassCode)}
            placeholder="VD: SA55"
            required
          />

          <SelectField
            label="Cơ sở"
            value={campus}
            onChange={change(setCampus)}
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
            Hãy thêm cơ sở trong Cài đặt trước.
          </p>
        )}

        <DatePicker
          label="Ngày dạy bù"
          value={date}
          onChange={change(setDate)}
        />

        <TimeSelect
          label="Giờ bắt đầu"
          value={startTime}
          onChange={change(setStartTime)}
          options={timeOptions}
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Field
            label="Số giờ dạy bù"
            type="number"
            min={1}
            max={5}
            step={1}
            value={hours}
            onChange={change(setHours)}
            placeholder="Từ 1 đến 5 giờ"
            required
          />

          <Field
            label="Số học sinh"
            type="number"
            min={1}
            max={5}
            step={1}
            value={studentCount}
            onChange={change(setStudentCount)}
            placeholder="Từ 1 đến 5 học sinh"
            required
          />
        </div>

        {validTime && validHours && (
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Ca dạy bù: {startTime} – {endTime}
            {endsNextDay ? " ngày kế tiếp" : ""}
            {" · "}
            {parsedHours} giờ
          </p>
        )}

        <Field
          label="Ghi chú"
          value={note}
          onChange={change(setNote)}
          placeholder="Nhập nội dung dạy bù hoặc ghi chú nếu có"
        />

        <div
          aria-live="polite"
          className="
            rounded-3xl bg-brand-50 p-4
            text-sm text-brand-800
            dark:bg-brand-950 dark:text-brand-200
          "
        >
          <p className="font-black">
            Lương dự kiến: {showEstimate ? money(estimate) : "—"}
          </p>
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
          disabled={saving || availableCampuses.length === 0}
          className="
            flex w-full items-center justify-center gap-2
            rounded-2xl bg-brand-600 px-4 py-4
            font-black text-white
            hover:bg-brand-hover
            disabled:cursor-not-allowed disabled:opacity-50
           transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <Save size={18} />
          {saving ? "Đang lưu…" : extra ? "Lưu thay đổi" : "Lưu lịch"}
        </button>
      </form>
    </ModalShell>
  );
}
