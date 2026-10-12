import { useState } from 'react';
import useIncomeData from './useIncomeData';
import useIncomeSummary from './useIncomeSummary';
import { currentMonthISO } from '../utils/date';

import {
  generateCourseSchedule,
  generateAllSchedules,
} from '../services/income';

import {
  getBookingSlots,
  getBookingConflictMessage,
} from '../utils/booking';

import { uid } from '../utils/id';

export default function useIncomeApp(userId) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthISO);
  const [modal, setModal] = useState(null);

  const data = useIncomeData(userId);
  const [bookingError, setBookingError] = useState('');

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
      'Xóa lớp này? Lịch học và các ngày nghỉ chỉ áp dụng cho lớp này cũng sẽ bị xóa.'
    );

    if (confirmed) {
      data.deleteCourse(id);
    }
  }

  async function saveCourseWithConflictCheck(values, id) {
    setBookingError('');
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
        data.settings
      );

      // Khi sửa lớp, loại lịch cũ của chính lớp đó khỏi phép so sánh.
      const otherSchedules = generateAllSchedules(
        data.courses.filter((course) => course.id !== id),
        data.holidays,
        data.overrides,
        data.settings
      );

      const message = getBookingConflictMessage(
        getBookingSlots(candidateSchedule.sessions),
        getBookingSlots(otherSchedules.sessions, data.extras)
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

  async function addExtraWithConflictCheck(values) {
    setBookingError('');
    data.clearSaveError();

    try {
      const schedules = generateAllSchedules(
        data.courses,
        data.holidays,
        data.overrides,
        data.settings
      );

      const message = getBookingConflictMessage(
        getBookingSlots([], [values]),
        getBookingSlots(schedules.sessions, data.extras)
      );

      if (message) {
        setBookingError(message);
        return false;
      }
    } catch (error) {
      setBookingError(error.message);
      return false;
    }

    return data.addExtra(values);
  }

  const actions = {
    openAddCourse: () => setModal({ type: 'course', course: null }),
    openEditCourse: (course) => setModal({ type: 'course', course }),
    openMakeup: () => setModal({ type: 'extra', workType: 'makeup' }),
    openJudge: () => setModal({ type: 'extra', workType: 'judge' }),
    openTrial: () => setModal({ type: 'extra', workType: 'trial' }),
    openHoliday: () => setModal({ type: 'holiday' }),
    openSalary: () => setModal({ type: 'salary' }),
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
        setBookingError('');
        data.clearSaveError();
      },
    },
    summary,
    actions,
  };
}