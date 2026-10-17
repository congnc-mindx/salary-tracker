import { useState } from "react";

import useIncomeApp from "./hooks/useIncomeApp";

import LoadingScreen from "./components/app/LoadingScreen";
import SaveFeedback from "./components/app/SaveFeedback";
import LocalImportBanner from "./components/app/LocalImportBanner";

import DashboardLayout from "./components/dashboard/DashboardLayout";
import PageContent from "./components/layout/PageContent";
import AppModals from "./components/modals/AppModals";
import CampusSettings from "./pages/SettingsPage/CampusSettings";

export default function App({ user, onSignOut }) {
  const [campusOpen, setCampusOpen] = useState(false);

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
  } = useIncomeApp(user?.uid);

  function openCampus() {
    setCampusOpen(true);
  }

  function closeCampus() {
    setCampusOpen(false);
  }

  if (data.loadError || data.loading) {
    return <LoadingScreen error={data.loadError} />;
  }

  const layoutActions = {
    ...actions,
    openCampus,
  };

  return (
    <>
      <SaveFeedback
        error={data.saveError}
        saving={data.saving}
        onDismiss={data.clearSaveError}
      />

      <fieldset
        disabled={data.saving}
        aria-busy={data.saving}
        className="m-0 min-w-0 border-0 p-0"
      >
        {data.canImportLocalData && (
          <LocalImportBanner onImport={data.importLocalData} />
        )}

        <DashboardLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          summary={summary}
          actions={layoutActions}
          onSignOut={onSignOut}
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
          campuses={data.campuses}
          onChooseTeachingType={actions.chooseTeachingType}
          holidays={data.holidays}
          overrides={data.overrides}
          extras={data.extras}
        />

        {campusOpen && (
          <CampusSettings
            campuses={data.campuses}
            onAddCampus={data.addCampus}
            onClose={closeCampus}
          />
        )}
      </fieldset>
    </>
  );
}
