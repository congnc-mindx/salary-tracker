import useIncomeApp from './hooks/useIncomeApp';
import DashboardLayout from './components/layout/DashboardLayout';
import PageContent from './components/layout/PageContent';
import AppModals from './components/modals/AppModals';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    modal,
    closeModal,
    data,
    summary,
    actions,
  } = useIncomeApp();

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
        onClose={closeModal}
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