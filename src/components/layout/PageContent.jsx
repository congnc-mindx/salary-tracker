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
  data,
  summary,
  actions,
}) {
  switch (activeTab) {
    case "overview":
      return (
        <CalendarBoard
          selectedMonth={selectedMonth}
          sessions={summary.monthSessions}
          skippedHolidays={summary.monthSkipped}
          extras={summary.monthExtras}
          settings={data.settings}
          updateSessionStatus={data.updateSessionStatus}
          updateExtraStatus={data.updateExtraStatus}
          holidays={data.holidays}
          onClassHoliday={actions.openClassHoliday}
        />
      );

    case "classes":
      return (
        <ClassesPage
          courses={data.courses}
          sessions={summary.sessions}
          skippedHolidays={summary.skippedHolidays}
          openAddCourse={actions.openAddCourse}
          openEditCourse={actions.openEditCourse}
          deleteCourse={actions.deleteCourse}
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
          expectedIncome={summary.expectedIncome}
          confirmedIncome={summary.confirmedIncome}
          waitingIncome={summary.waitingIncome}
          teacherBreakdown={summary.teacherBreakdown}
          makeupBreakdown={summary.makeupBreakdown}
          substituteBreakdown={summary.substituteBreakdown}
          judgeBreakdown={summary.judgeBreakdown}
          trialBreakdown={summary.trialBreakdown}
          leaveSummary={summary.leaveSummary}
        />
      );

    case "settings":
      return (
        <SettingsPage
          settings={data.settings}
          currentTeacherRate={summary.currentTeacherRate}
          openSalary={actions.openSalary}
          campuses={data.campuses}
          onAddCampus={data.addCampus}
        />
      );

    default:
      return <p className="font-semibold">Không tìm thấy trang.</p>;
  }
}
