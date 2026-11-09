import ReviewsPage from "../../pages/ReviewsPage/ReviewsPage";
import CalendarBoard from "../calendar/CalendarBoard";

import ClassesPage from "../../pages/ClassesPage/ClassesPage";
import MakeupPage from "../../pages/MakeupPage/MakeupPage";
import JudgePage from "../../pages/JudgePage/JudgePage";
import TrialsPage from "../../pages/TrialsPage/TrialsPage";
import HolidaysPage from "../../pages/HolidaysPage/HolidaysPage";
import SalaryPage from "../../pages/SalaryPage/SalaryPage";
import SettingsPage from "../../pages/SettingsPage/SettingsPage";

export default function PageContent({
  activeTab,
  selectedMonth,
  setSelectedMonth,
  data,
  summary,
  actions,
}) {
  switch (activeTab) {
    case "overview":
      return (
        <CalendarBoard
          selectedMonth={selectedMonth}
          overview={summary.overview}
          holidays={data.holidays}
          onClassHoliday={actions.openClassHoliday}
          onEditExtra={actions.openEditTeaching}
          onEditHoliday={actions.openEditHoliday}
          updateSessionStatus={data.updateSessionStatus}
          updateExtraStatus={data.updateExtraStatus}
        />
      );

    case "classes":
      return (
        <ClassesPage
          selectedMonth={selectedMonth}
          courses={data.courses}
          sessions={summary.sessions}
          skippedHolidays={summary.skippedHolidays}
          openAddCourse={actions.openAddCourse}
          openEditCourse={actions.openEditCourse}
          deleteCourse={actions.deleteCourse}
          templates={data.settings.finalReviewTemplates || {}}
          onSaveCourse={data.saveCourse}
        />
      );

    case "makeup":
      return (
        <MakeupPage
          extras={summary.monthExtras}
          settings={data.settings}
          openAdd={actions.openTeaching}
          onEdit={actions.openEditTeaching}
          updateExtraStatus={data.updateExtraStatus}
        />
      );

    case "judge":
      return (
        <JudgePage
          extras={summary.monthExtras}
          settings={data.settings}
          openAdd={actions.openJudge}
          updateExtraStatus={data.updateExtraStatus}
        />
      );

    case "trial":
      return (
        <TrialsPage
          extras={summary.monthExtras}
          settings={data.settings}
          openAdd={actions.openTrial}
          updateExtraStatus={data.updateExtraStatus}
        />
      );

    case "holidays":
      return (
        <HolidaysPage
          selectedMonth={selectedMonth}
          holidays={data.holidays}
          courses={data.courses}
          openAdd={actions.openHoliday}
          deleteHoliday={data.deleteHoliday}
          onEdit={actions.openEditHoliday}
        />
      );

    case "salary":
      return (
        <SalaryPage
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          courses={data.courses}
          sessions={summary.sessions}
          skippedHolidays={summary.skippedHolidays}
          extras={data.extras}
          holidays={data.holidays}
          settings={data.settings}
        />
      );

    case "reviews":
      return (
        <ReviewsPage
          onSaveSubjectGroup={data.saveSubjectGroup}
          userId={data.userId}
          onSaveSessionTemplate={data.saveSessionTemplate}
          onSaveSessionReview={data.saveSessionReview}
          onCompleteSessionReview={data.setSessionReviewCompleted}
          courses={data.courses}
          sessions={summary.sessions}
          templates={data.settings.finalReviewTemplates || {}}
          onSaveTemplate={data.saveFinalReviewTemplate}
          onSaveCourse={data.saveCourse}
        />
      );

    case "settings":
      return (
        <SettingsPage
          data={data}
          openCampus={actions.openCampus}
          openSubjectGroup={actions.openSubjectGroup}
          settings={data.settings}
          currentTeacherRate={summary.currentTeacherRate}
          openSalary={actions.openSalary}
          cancelledExtraCount={
            data.extras.filter((item) => item.status === "cancelled").length
          }
          onPurgeCancelledExtras={data.purgeCancelledExtras}
        />
      );

    default:
      return <p className="font-semibold">Không tìm thấy trang.</p>;
  }
}
