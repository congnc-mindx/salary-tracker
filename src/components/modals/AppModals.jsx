import CourseModal from "./CourseModal";
import HolidayModal from "./HolidayModal";
import ExtraWorkModal from "./ExtraWorkModal";
import SalaryRateModal from "./SalaryRateModal";
import JudgeModal from "./JudgeModal";
import MakeupModal from "./MakeupModal";
import TeachingTypeModal from "./TeachingTypeModal";
import SingleTeachingModal from "./SingleTeachingModal";

export default function AppModals({
  modal,
  onClose,
  courses,
  campuses,
  settings,
  currentTeacherRate,
  onSaveCourse,
  onAddHoliday,
  onAddExtra,
  onAddSalaryRate,
  onChooseTeachingType,
  holidays,
  overrides,
  extras,
}) {
  if (!modal) return null;

  async function saveAndClose(save, ...args) {
    const success = await save(...args);

    if (success === true) {
      onClose();
    }

    return success;
  }

  switch (modal.type) {
    case "course":
      return (
        <CourseModal
          key={modal.course?.id ?? "new-course"}
          course={modal.course}
          onClose={onClose}
          onSave={(data, id) => saveAndClose(onSaveCourse, data, id)}
          campuses={campuses}
        />
      );

    case "holiday":
      return (
        <HolidayModal
          key={
            modal.holiday?.id ||
            (modal.session
              ? `${modal.session.courseId}:${modal.session.date}`
              : "new-holiday")
          }
          holiday={modal.holiday ?? null}
          initialSession={modal.session ?? null}
          courses={courses}
          holidays={holidays}
          overrides={overrides}
          extras={extras}
          settings={settings}
          onClose={onClose}
          onSave={(values, id) => saveAndClose(onAddHoliday, values, id)}
        />
      );

    case "teaching-picker":
      return (
        <TeachingTypeModal onClose={onClose} onChoose={onChooseTeachingType} />
      );

    case "extra":
      if (["substitute", "trial"].includes(modal.workType)) {
        return (
          <SingleTeachingModal
            key={modal.extra?.id ?? modal.workType}
            type={modal.workType}
            extra={modal.extra ?? null}
            campuses={campuses}
            settings={settings}
            onClose={onClose}
            onSave={(data, id) => saveAndClose(onAddExtra, data, id)}
          />
        );
      }
      if (modal.workType === "makeup") {
        return (
          <MakeupModal
            key={modal.extra?.id ?? "new-makeup"}
            extra={modal.extra ?? null}
            campuses={campuses}
            settings={settings}
            onClose={onClose}
            onSave={(data, id) => saveAndClose(onAddExtra, data, id)}
          />
        );
      }
      if (modal.workType === "judge") {
        return (
          <JudgeModal
            key={modal.extra?.id ?? "new-judge"}
            extra={modal.extra ?? null}
            campuses={campuses}
            settings={settings}
            onClose={onClose}
            onSave={(data, id) => saveAndClose(onAddExtra, data, id)}
          />
        );
      }

      return (
        <ExtraWorkModal
          key={modal.workType}
          type={modal.workType}
          settings={settings}
          onClose={onClose}
          onSave={(data) => saveAndClose(onAddExtra, data)}
        />
      );

    case "salary":
      return (
        <SalaryRateModal
          currentRate={currentTeacherRate}
          onClose={onClose}
          onSave={(rate, effectiveDate) =>
            saveAndClose(onAddSalaryRate, rate, effectiveDate)
          }
        />
      );

    default:
      return null;
  }
}
