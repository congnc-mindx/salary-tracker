import { useState } from 'react';

import useIncomeData from './hooks/useIncomeData';
import useIncomeSummary from './hooks/useIncomeSummary';
import { currentMonthISO } from './utils/date';

import DashboardLayout from './components/layout/DashboardLayout';
import PageContent from './components/layout/PageContent';
import AppModals from './components/modals/AppModals';

export default function App() {
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

  function deleteCourse(id) {
    const ok = window.confirm(
      'Xóa lớp này? Lịch học và các ngày nghỉ chỉ áp dụng cho lớp này cũng sẽ bị xóa.'
    );

    if (ok) data.deleteCourse(id);
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

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        summary={summary}
        actions={actions}
      >
        <PageContent
          activeTab={activeTab}
          selectedMonth={selectedMonth}
          data={data}
          summary={summary}
          actions={actions}
        />
      </DashboardLayout>

      <AppModals
        modal={modal}
        onClose={() => setModal(null)}
        courses={data.courses}
        settings={data.settings}
        currentTeacherRate={summary.currentTeacherRate}
        onSaveCourse={data.saveCourse}
        onAddHoliday={data.addHoliday}
        onAddExtra={data.addExtra}
        onAddSalaryRate={data.addSalaryRate}
      />
    </>
  );
}