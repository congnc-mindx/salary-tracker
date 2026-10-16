import { useState } from "react";
import useIncomeData from "./useIncomeData";
import useIncomeSummary from "./useIncomeSummary";
import { currentMonthISO } from "../utils/date";
import { validateTeachingExtra } from "../utils/extra";

import {
  applyHolidaysToExtras,
  getExtraHoliday,
  isPersonalHoliday,
  validateHoliday,
} from "../utils/holidays";

import {
  generateCourseSchedule,
  generateAllSchedules,
} from "../services/income";

import { getBookingSlots, getBookingConflictMessage } from "../utils/booking";

import { uid } from "../utils/id";

export default function useIncomeApp(userId) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthISO);
  const [modal, setModal] = useState(null);

  const data = useIncomeData(userId);
  const [bookingError, setBookingError] = useState("");

  const summary = useIncomeSummary({
    courses: data.courses,
    holidays: data.holidays,
    overrides: data.overrides,
    extras: data.extras,
    settings: data.settings,
    selectedMonth,
  });

  function closeModal() {
    setModal(null);
  }

  function deleteCourse(id) {
    const confirmed = window.confirm(
      "Xóa lớp này? Lịch học và các ngày nghỉ chỉ áp dụng cho lớp này cũng sẽ bị xóa.",
    );

    if (confirmed) {
      data.deleteCourse(id);
    }
  }

  async function saveCourseWithConflictCheck(values, id) {
    setBookingError("");
    data.clearSaveError();

    try {
      const previous = id
        ? data.courses.find((course) => course.id === id)
        : null;

      const candidateCourse = {
        ...previous,
        ...values,
        id: id ?? uid(),
      };

      const candidateSchedule = generateCourseSchedule(
        candidateCourse,
        data.holidays,
        data.overrides,
        data.settings,
      );

      // Khi sửa lớp, loại lịch cũ của chính lớp đó khỏi phép so sánh.
      const otherSchedules = generateAllSchedules(
        data.courses.filter((course) => course.id !== id),
        data.holidays,
        data.overrides,
        data.settings,
      );

      const message = getBookingConflictMessage(
        getBookingSlots(candidateSchedule.sessions),
        getBookingSlots(
          otherSchedules.sessions,
          applyHolidaysToExtras(data.extras, data.holidays),
        ),
      );

      if (message) {
        setBookingError(message);
        return false;
      }
    } catch (error) {
      setBookingError(error.message);
      return false;
    }

    return data.saveCourse(values, id);
  }

  async function addExtraWithConflictCheck(values, id) {
    setBookingError("");
    data.clearSaveError();

    const previous = id ? data.extras.find((item) => item.id === id) : null;

    if (id && (!previous || previous.type !== values.type)) {
      setBookingError("Không tìm thấy lịch phù hợp để sửa. Hãy tải lại trang.");
      return false;
    }

    const payload = {
      ...values,
      status: previous?.status ?? values.status,
    };

    const validation = validateTeachingExtra(payload);

    if (validation) {
      setBookingError(validation);
      return false;
    }

    const previousLeave = previous
      ? getExtraHoliday(previous, data.holidays)
      : null;

    const nextLeave = getExtraHoliday(payload, data.holidays);

    // Cho sửa ghi chú của lịch cũ đang nghỉ.
    // Chặn tạo mới, chuyển giờ hoặc chuyển ngày vào khoảng nghỉ.
    const keepsExistingTime =
      previous &&
      previous.datetime === payload.datetime &&
      Number(previous.hours ?? 2) === Number(payload.hours ?? 2);

    if (nextLeave && !(previousLeave && keepsExistingTime)) {
      setBookingError(
        `Lịch này trùng khoảng nghỉ ${nextLeave.startDate} đến ` +
          `${nextLeave.endDate}. Hãy chọn ngày khác hoặc sửa ngày nghỉ.`,
      );
      return false;
    }

    try {
      const schedules = generateAllSchedules(
        data.courses,
        data.holidays,
        data.overrides,
        data.settings,
      );

      const message = getBookingConflictMessage(
        getBookingSlots([], applyHolidaysToExtras([payload], data.holidays)),
        getBookingSlots(
          schedules.sessions,
          applyHolidaysToExtras(
            data.extras.filter((item) => item.id !== id),
            data.holidays,
          ),
        ),
      );

      if (message) {
        setBookingError(message);
        return false;
      }
    } catch (error) {
      setBookingError(error.message);
      return false;
    }

    return data.addExtra(payload, id);
  }

  function openTeachingModal(nextModal) {
    setBookingError("");
    data.clearSaveError();
    setModal(nextModal);
  }

  function checkHolidayChanges(nextHolidays) {
    const before = generateAllSchedules(
      data.courses,
      data.holidays,
      data.overrides,
      data.settings,
    );

    const after = generateAllSchedules(
      data.courses,
      nextHolidays,
      data.overrides,
      data.settings,
    );

    const previousByKey = new Map(
      before.sessions.map((item) => [item.key, item]),
    );

    const nextByKey = new Map(after.sessions.map((item) => [item.key, item]));

    // Override cũ đang gắn với số buổi.
    // Không cho phép âm thầm chuyển trạng thái đó sang ngày khác.
    for (const override of data.overrides) {
      const oldSession = previousByKey.get(override.key);
      const newSession = nextByKey.get(override.key);

      if (oldSession && (!newSession || oldSession.date !== newSession.date)) {
        throw new Error(
          `Thay đổi này làm dời buổi ${oldSession.sessionNo} của lớp ` +
            `${oldSession.courseCode}, trong khi buổi đó đã có trạng thái lưu riêng. ` +
            "Cần xử lý trạng thái buổi này trước để tránh gán nhầm sang ngày khác.",
        );
      }
    }

    const beforeExtras = applyHolidaysToExtras(data.extras, data.holidays);

    const afterExtras = applyHolidaysToExtras(data.extras, nextHolidays);

    const oldSlots = getBookingSlots(before.sessions, beforeExtras);
    const newSlots = getBookingSlots(after.sessions, afterExtras);

    const slotKey = (item) => `${item.label}|${item.start}|${item.end}`;

    const oldSlotKeys = new Set(oldSlots.map(slotKey));

    // Chỉ kiểm tra các lịch mới xuất hiện hoặc vừa bị dời.
    for (let index = 0; index < newSlots.length; index += 1) {
      const candidate = newSlots[index];

      if (oldSlotKeys.has(slotKey(candidate))) continue;

      const message = getBookingConflictMessage(
        [candidate],
        newSlots.filter((_, otherIndex) => otherIndex !== index),
      );

      if (message) throw new Error(message);
    }

    // Những buổi đã xác nhận bị đổi ngày hoặc đổi trạng thái
    // cần được người dùng thấy trước khi ghi.
    const changedConfirmedSessions = before.sessions.filter((item) => {
      if (item.status !== "confirmed") return false;

      const next = nextByKey.get(item.key);

      return !next || next.date !== item.date || next.status !== item.status;
    });

    const nextExtrasById = new Map(afterExtras.map((item) => [item.id, item]));

    const changedConfirmedExtras = beforeExtras.filter(
      (item) =>
        item.status === "confirmed" &&
        nextExtrasById.get(item.id)?.status !== "confirmed",
    );

    const changedCount =
      changedConfirmedSessions.length + changedConfirmedExtras.length;

    if (
      changedCount > 0 &&
      !window.confirm(
        `Thay đổi này ảnh hưởng ${changedCount} lịch đã xác nhận ` +
          "và sẽ tính lại thu nhập. Bạn có muốn tiếp tục không?",
      )
    ) {
      return false;
    }

    return true;
  }

  async function saveHolidayWithCheck(values, id) {
    setBookingError("");
    data.clearSaveError();

    try {
      const validation = validateHoliday(values, data.courses);
      if (validation) throw new Error(validation);

      if (id && !data.holidays.some((item) => item.id === id)) {
        throw new Error("Ngày nghỉ không còn tồn tại. Hãy tải lại trang.");
      }

      const personal = isPersonalHoliday(values);

      const overlapping = data.holidays.find((item) => {
        if (item.id === id) return false;

        const sameScope =
          personal === isPersonalHoliday(item) &&
          (personal || item.applyTo === values.applyTo);

        return (
          sameScope &&
          values.startDate <= item.endDate &&
          values.endDate >= item.startDate
        );
      });

      if (overlapping) {
        throw new Error(
          "Đã có khoảng nghỉ cùng loại bị trùng ngày. " +
            "Bạn hãy sửa khoảng nghỉ cũ hoặc chọn khoảng khác.",
        );
      }

      const nextHolidays = [
        ...data.holidays.filter((item) => item.id !== id),
        { ...values, id: id || "__new-holiday__" },
      ];

      if (!checkHolidayChanges(nextHolidays)) return false;

      return data.addHoliday(values, id);
    } catch (error) {
      setBookingError(error.message);
      return false;
    }
  }

  async function deleteHolidayWithCheck(id) {
    setBookingError("");
    data.clearSaveError();

    if (
      !window.confirm(
        "Xóa ngày nghỉ này? Lịch học và thu nhập liên quan sẽ được tính lại.",
      )
    ) {
      return false;
    }

    try {
      const nextHolidays = data.holidays.filter((item) => item.id !== id);

      if (!checkHolidayChanges(nextHolidays)) return false;

      return data.deleteHoliday(id);
    } catch (error) {
      setBookingError(error.message);
      return false;
    }
  }

  function openHolidayModal(holiday = null, session = null) {
    setBookingError("");
    data.clearSaveError();

    setModal({
      type: "holiday",
      holiday,
      session,
    });
  }

  const actions = {
    openTeaching: () =>
      openTeachingModal({
        type: "teaching-picker",
      }),

    chooseTeachingType: (workType) =>
      openTeachingModal({
        type: "extra",
        workType,
        extra: null,
      }),

    openEditTeaching: (extra) =>
      openTeachingModal({
        type: "extra",
        workType: extra.type,
        extra,
      }),
    openAddCourse: () => setModal({ type: "course", course: null }),
    openEditCourse: (course) => setModal({ type: "course", course }),
    openMakeup: () => {
      setBookingError("");
      data.clearSaveError();

      setModal({
        type: "extra",
        workType: "makeup",
        extra: null,
      });
    },

    openEditMakeup: (extra) => {
      setBookingError("");
      data.clearSaveError();

      setModal({
        type: "extra",
        workType: "makeup",
        extra,
      });
    },
    openJudge: () => setModal({ type: "extra", workType: "judge" }),
    openTrial: () => setModal({ type: "extra", workType: "trial" }),
    openHoliday: () => openHolidayModal(),
    openEditHoliday: (holiday) => openHolidayModal(holiday),
    openClassHoliday: (session) => openHolidayModal(null, session),
    openSalary: () => setModal({ type: "salary" }),
    deleteCourse,
  };

  return {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    modal,
    closeModal,
    summary,
    actions,
    data: {
      ...data,
      saveCourse: saveCourseWithConflictCheck,
      addExtra: addExtraWithConflictCheck,
      addHoliday: saveHolidayWithCheck,
      deleteHoliday: deleteHolidayWithCheck,
      saveError: bookingError || data.saveError,
      clearSaveError: () => {
        setBookingError("");
        data.clearSaveError();
      },
    },
  };
}
