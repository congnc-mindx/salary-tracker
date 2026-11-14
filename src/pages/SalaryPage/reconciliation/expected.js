import { getCourseTitle, getCampusCode } from "../../../utils/courseDisplay";
import { getExtraAmount } from "../../../services/income";
import { getExtraHours, extraTitle } from "../../../utils/extra";
import { applyHolidaysToExtras } from "../../../utils/holidays";
import { canonicalClass } from "./model";
export function buildExpected({
  courses,
  sessions,
  extras,
  holidays,
  settings,
}) {
  const map = new Map(courses.map((c) => [c.id, c]));
  return [
    ...sessions
      .filter((s) => ["confirmed", "planned"].includes(s.status))
      .map((s) => {
        const c = map.get(s.courseId);
        const title = getCourseTitle(c) || s.courseCode;
        return {
          id: "class:" + s.key,
          courseId: s.courseId,
          title,
          classKey: canonicalClass(title),
          campus: getCampusCode(c?.campus),
          campusName: c?.campus || "",
          type: "class",
          date: s.date,
          time: s.startTime,
          hours: 2,
          students: null,
          total: s.amount,
          price: s.amount / 2,
          status: s.status,
          sessionNo: s.sessionNo,
        };
      }),
    ...applyHolidaysToExtras(extras, holidays)
      .filter((e) => ["confirmed", "planned"].includes(e.status))
      .map((e) => {
        const title =
            getCourseTitle({ code: e.classCode, campus: e.campus }) ||
            extraTitle(e),
          hours = getExtraHours(e),
          total = getExtraAmount(e, settings);
        return {
          id: "extra:" + e.id,
          extraId: e.id,
          title,
          classKey: canonicalClass(title),
          campus:
            e.type === "trial" && e.trialMode === "ONL"
              ? "ONLINE"
              : getCampusCode(e.campus),
          campusName: e.campus || "",
          type: e.type,
          date: e.datetime.slice(0, 10),
          time: e.datetime.slice(11, 16),
          hours,
          students: e.studentCount ?? null,
          total,
          price: ["class", "makeup", "substitute"].includes(e.type)
            ? total / hours
            : null,
          status: e.status,
        };
      }),
  ].sort((a, b) =>
    (a.date + a.time + a.id).localeCompare(b.date + b.time + b.id),
  );
}
