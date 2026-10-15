import { useState } from "react";
import useIncomeData from "./useIncomeData";
import useIncomeSummary from "./useIncomeSummary";
import { currentMonthISO } from "../utils/date";
import { validateTeachingExtra } from "../utils/extra";

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
        getBookingSlots(otherSchedules.sessions, data.extras),
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

    try {
      const schedules = generateAllSchedules(
        data.courses,
        data.holidays,
        data.overrides,
        data.settings,
      );

      const message = getBookingConflictMessage(
        getBookingSlots([], [payload]),
        getBookingSlots(
          schedules.sessions,
          data.extras.filter((item) => item.id !== id),
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
    openHoliday: () => setModal({ type: "holiday" }),
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
    data: {
      ...data,
      saveCourse: saveCourseWithConflictCheck,
      addExtra: addExtraWithConflictCheck,
      saveError: bookingError || data.saveError,
      clearSaveError: () => {
        setBookingError("");
        data.clearSaveError();
      },
    },
    summary,
    actions,
  };
}
