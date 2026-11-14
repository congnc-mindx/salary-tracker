import { useEffect, useState } from "react";
import OverviewAgenda from "../dashboard/OverviewAgenda";
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
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  data,
  summary,
  actions,
}) {
  const [classesView, setClassesView] = useState("calendar");
  useEffect(() => { if (activeTab !== "classes") setClassesView("calendar"); }, [activeTab]);
  const calendarProps = { selectedMonth, overview: summary.overview, holidays: data.holidays,
    onClassHoliday: actions.openClassHoliday, onEditExtra: actions.openEditTeaching,
    onEditHoliday: actions.openEditHoliday, updateSessionStatus: data.updateSessionStatus,
    updateExtraStatus: data.updateExtraStatus };
  const openCalendar = (date) => {
    setSelectedMonth(date.slice(0,7)); setClassesView("calendar"); setActiveTab("classes");
  };
  switch (activeTab) {
    case "overview":
      return (
        <OverviewAgenda overview={summary.overview} holidays={data.holidays}
          courses={data.courses} calendarProps={calendarProps} onOpenCalendar={openCalendar}
          onEditHoliday={actions.openEditHoliday} />
      );

    case "classes":
      return (
        <div>
          <div className="mb-5 flex gap-2" role="group" aria-label="Chế độ xem lớp học">
            {[["calendar", "Lịch dạy"], ["courses", "Các lớp"]].map(([value,label]) =>
              <button type="button" key={value} aria-pressed={classesView === value}
                onClick={() => setClassesView(value)} className={`min-h-11 rounded-xl px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-brand-500 ${classesView === value ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{label}</button>)}
          </div>
          {classesView === "calendar" ? <CalendarBoard {...calendarProps} /> : <ClassesPage
          selectedMonth={selectedMonth}
          courses={data.courses}
          sessions={summary.sessions}
          skippedHolidays={summary.skippedHolidays}
          openAddCourse={actions.openAddCourse}
          openEditCourse={actions.openEditCourse}
          deleteCourse={actions.deleteCourse}
          templates={data.settings.finalReviewTemplates || {}}
          onSaveCourse={data.saveCourse}
        />}
        </div>
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
          userId={data.userId}
          onEditCourse={actions.openEditCourse}
          onEditExtra={actions.openEditTeaching}
          onAddPayrollExtra={actions.openPayrollExtra}
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
