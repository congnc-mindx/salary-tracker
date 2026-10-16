import { useRef, useState } from "react";
import { Save } from "lucide-react";

import ModalShell from "../common/ModalShell";
import Field from "../common/Field";
import SelectField from "../common/SelectField";
import DatePicker from "../common/DatePicker";

import { todayISO, formatDateVN, formatDateTimeVN } from "../../utils/date";

import {
  holidayKey,
  isPersonalHoliday,
  validateHoliday,
  getExtraHoliday,
} from "../../utils/holidays";

import { extraTitle } from "../../utils/extra";
import { generateAllSchedules } from "../../services/income";

export default function HolidayModal({
  holiday = null,
  initialSession = null,
  courses = [],
  holidays = [],
  overrides = [],
  extras = [],
  settings,
  onClose,
  onSave,
}) {
  const [kind, setKind] = useState(
    holiday
      ? isPersonalHoliday(holiday)
        ? "personal"
        : "class"
      : initialSession
        ? "class"
        : "personal",
  );

  const [courseId, setCourseId] = useState(
    holiday && !isPersonalHoliday(holiday)
      ? holiday.applyTo
      : initialSession?.courseId || "",
  );

  const [startDate, setStartDate] = useState(
    holiday?.startDate || initialSession?.date || todayISO(),
  );

  const [endDate, setEndDate] = useState(
    holiday?.endDate || initialSession?.date || todayISO(),
  );

  const [note, setNote] = useState(holiday?.note ?? holiday?.title ?? "");

  const [decisions, setDecisions] = useState(holiday?.decisions || {});

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const busyRef = useRef(false);

  const draftId = holiday?.id || "__new-holiday__";

  const values = {
    kind,
    applyTo: kind === "personal" ? "all" : courseId,
    startDate,
    endDate,
    note: note.trim(),
    title: note.trim() || (kind === "personal" ? "Nghỉ cá nhân" : "Lớp nghỉ"),
    decisions: kind === "personal" ? decisions : {},
  };

  const validation = validateHoliday(values, courses);

  let previewError = "";
  let affected = [];
  let affectedExtras = [];

  if (!validation) {
    try {
      const draft = { ...values, id: draftId };

      const nextHolidays = [
        ...holidays.filter((item) => item.id !== holiday?.id),
        draft,
      ];

      const result = generateAllSchedules(
        courses,
        nextHolidays,
        overrides,
        settings,
      );

      affected = [
        ...result.sessions
          .filter((item) => item.holidayId === draftId)
          .map((item) => ({
            ...item,
            action: "covered",
          })),

        ...result.skippedHolidays
          .filter((item) => item.holidayId === draftId)
          .map((item) => ({
            ...item,
            action: "postpone",
          })),
      ].sort((a, b) =>
        `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
      );

      affectedExtras = extras.filter(
        (item) => item.status !== "cancelled" && getExtraHoliday(item, [draft]),
      );
    } catch (err) {
      previewError = err.message;
    }
  }

  function changeStartDate(value) {
    setStartDate(value);

    if (value && (!endDate || endDate < value)) {
      setEndDate(value);
    }
  }

  function applyAll(action) {
    setDecisions((previous) => {
      const next = { ...previous };

      affected.forEach((item) => {
        next[holidayKey(item.courseId, item.date)] = action;
      });

      return next;
    });
  }

  async function submit() {
    if (busyRef.current) return;

    setError("");

    if (validation || previewError) {
      setError(validation || previewError);
      return;
    }

    busyRef.current = true;
    setSaving(true);

    try {
      const success = await onSave(values, holiday?.id);

      if (success === false) {
        setError(
          "Chưa lưu được ngày nghỉ. Hãy kiểm tra thông báo lỗi phía trên.",
        );
      }
    } catch (err) {
      setError(err.message || "Không lưu được ngày nghỉ.");
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={holiday ? "Chỉnh sửa ngày nghỉ" : "Thêm ngày nghỉ"}
      onClose={onClose}
    >
      <fieldset disabled={saving} className="min-w-0 space-y-4">
        <SelectField
          label="Loại nghỉ"
          value={kind}
          onChange={setKind}
          options={[
            { value: "personal", label: "Tôi nghỉ" },
            { value: "class", label: "Một lớp nghỉ" },
          ]}
        />

        {kind === "class" && (
          <SelectField
            label="Lớp nghỉ"
            value={courseId}
            onChange={setCourseId}
            options={[
              {
                value: "",
                label: "Chọn lớp",
                disabled: true,
              },
              ...courses.map((course) => ({
                value: course.id,
                label: `${course.code}${
                  course.campus ? ` · ${course.campus}` : ""
                }`,
              })),
            ]}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <DatePicker
            label="Từ ngày"
            value={startDate}
            onChange={changeStartDate}
          />

          <DatePicker
            label="Đến ngày"
            value={endDate}
            min={startDate}
            onChange={setEndDate}
          />
        </div>

        <Field
          label="Ghi chú — không bắt buộc"
          value={note}
          onChange={setNote}
          placeholder="VD: Về quê, việc cá nhân, lớp xin nghỉ..."
        />

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="font-black text-slate-900 dark:text-slate-100">
            Lịch bị ảnh hưởng
          </p>

          {validation || previewError ? (
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              {validation || previewError}
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {affected.length} buổi lớp · {affectedExtras.length} lịch phát
                sinh
              </p>

              {kind === "personal" && affected.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyAll("postpone")}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Lùi tất cả buổi
                  </button>

                  <button
                    type="button"
                    onClick={() => applyAll("covered")}
                    className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    Tất cả có người thay
                  </button>
                </div>
              )}

              <div className="mt-3 max-h-72 space-y-3 overflow-y-auto">
                {affected.map((item) => {
                  const key = holidayKey(item.courseId, item.date);

                  return (
                    <div
                      key={key}
                      className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                    >
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {item.courseCode} · Buổi {item.sessionNo}
                      </p>

                      <p className="mb-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {formatDateVN(item.date)} · {item.startTime}
                      </p>

                      {kind === "personal" ? (
                        <SelectField
                          label="Cách xử lý"
                          value={decisions[key] || "postpone"}
                          onChange={(value) =>
                            setDecisions((previous) => ({
                              ...previous,
                              [key]: value,
                            }))
                          }
                          options={[
                            {
                              value: "postpone",
                              label: "Lùi buổi học",
                            },
                            {
                              value: "covered",
                              label: "Có người dạy thay",
                            },
                          ]}
                        />
                      ) : (
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                          Lùi buổi sang lịch học tiếp theo
                        </p>
                      )}
                    </div>
                  );
                })}

                {affectedExtras.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                  >
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {extraTitle(item)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {formatDateTimeVN(item.datetime)}
                    </p>
                    <p className="mt-2 text-sm font-bold text-rose-700 dark:text-rose-300">
                      Không tính lương · Không tự dời lịch
                    </p>
                  </div>
                ))}
              </div>

              {!affected.length && !affectedExtras.length && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Không có lịch bị ảnh hưởng thêm trong khoảng này.
                </p>
              )}
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={saving || Boolean(validation || previewError)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Đang lưu..." : holiday ? "Lưu thay đổi" : "Lưu ngày nghỉ"}
        </button>
      </fieldset>
    </ModalShell>
  );
}
