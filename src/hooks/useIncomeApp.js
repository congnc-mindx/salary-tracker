import { useState } from "react";
import useIncomeData from "./useIncomeData";
import useIncomeSummary from "./useIncomeSummary";
import { currentMonthISO } from "../utils/date";

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

    if (id && !previous) {
      setBookingError("Không tìm thấy lịch cần sửa. Bạn hãy tải lại trang.");
      return false;
    }

    // Giữ trạng thái hiện tại khi sửa thông tin.
    const payload = {
      ...values,
      status: previous?.status ?? values.status,
    };

    if (payload.type === "makeup") {
      const validHours =
        Number.isInteger(payload.hours) &&
        payload.hours >= 1 &&
        payload.hours <= 5;

      const validStudents =
        Number.isInteger(payload.studentCount) &&
        payload.studentCount >= 1 &&
        payload.studentCount <= 5;

      if (!payload.classCode?.trim() || !payload.campus?.trim()) {
        setBookingError("Bạn hãy nhập mã lớp và chọn cơ sở.");
        return false;
      }

      if (!validHours || !validStudents) {
        setBookingError("Số giờ và số học sinh phải là số nguyên từ 1 đến 5.");
        return false;
      }
    }

    try {
      const schedules = generateAllSchedules(
        data.courses,
        data.holidays,
        data.overrides,
        data.settings,
      );

      // Bỏ chính lịch đang sửa khỏi danh sách so sánh.
      const otherExtras = data.extras.filter((item) => item.id !== id);

      const message = getBookingConflictMessage(
        getBookingSlots([], [payload]),
        getBookingSlots(schedules.sessions, otherExtras),
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

  const actions = {
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
