import CourseModal from './CourseModal';
import HolidayModal from './HolidayModal';
import ExtraWorkModal from './ExtraWorkModal';
import SalaryRateModal from './SalaryRateModal';

export default function AppModals({
  modal,
  onClose,
  courses,
  settings,
  currentTeacherRate,
  onSaveCourse,
  onAddHoliday,
  onAddExtra,
  onAddSalaryRate,
}) {
  if (!modal) return null;

  function saveAndClose(save, ...args) {
    save(...args);
    onClose();
  }

  switch (modal.type) {
    case 'course':
      return (
        <CourseModal
          key={modal.course?.id ?? 'new-course'}
          course={modal.course}
          onClose={onClose}
          onSave={(data, id) => saveAndClose(onSaveCourse, data, id)}
        />
      );

    case 'holiday':
      return (
        <HolidayModal
          courses={courses}
          onClose={onClose}
          onSave={(data) => saveAndClose(onAddHoliday, data)}
        />
      );

    case 'extra':
      return (
        <ExtraWorkModal
          key={modal.workType}
          type={modal.workType}
          settings={settings}
          onClose={onClose}
          onSave={(data) => saveAndClose(onAddExtra, data)}
        />
      );

    case 'salary':
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