import { useState } from 'react';
import useIncomeData from './useIncomeData';
import useIncomeSummary from './useIncomeSummary';
import { currentMonthISO } from '../utils/date';

export default function useIncomeApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthISO);
  const [modal, setModal] = useState(null);

  const data = useIncomeData();

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
    data,
    summary,
    actions,
  };
}