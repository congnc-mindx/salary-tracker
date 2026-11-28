import {confirmAction} from "../../components/common/feedback";
import SubjectSettings from "./SubjectSettings";
import CampusEditor from "./CampusEditor";
import { useState } from "react";
import DataSettings from "./DataSettings";
import { money } from "../../utils/format";

const cardClass =
  "rounded-3xl border border-slate-200 bg-white p-3 shadow-sm " +
  "dark:border-slate-700 dark:bg-slate-900";

export default function SettingsPage({
  data,
  openCampus,
  settings,
  currentTeacherRate,
  openSalary,
  cancelledExtraCount = 0,
  onPurgeCancelledExtras,
}) {
  const [tab, setTab] = useState("income");
  const hourlyRate = currentTeacherRate / 2;

  // makeUpRatio hiện được áp dụng vào lương một buổi 2 giờ.
  // 0,375 × 2 = 0,75 = 75% lương một giờ.
  const makeupHourlyPercent = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(settings.makeUpRatio * 2 * 100);

  return (
    <section className="space-y-3">
      <nav aria-label="Nhóm cài đặt" className="flex flex-wrap gap-2">
        {[
          ["income", "Thu nhập"],
          ["subjects", "Bộ môn"],
          ["data", "Dữ liệu"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={`min-h-11 rounded-xl px-5 text-sm font-bold ${tab === key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "subjects" && <SubjectSettings settings={settings} onSave={data.saveSubjectGroup}/>}
      {tab === "data" && <DataSettings data={data} />}
      {tab === "income" && (
        <>
          <div className="grid items-stretch gap-3 md:grid-cols-2">
            <section className={cardClass}>
              <h2 className="text-base font-black">Mức lương hiện tại</h2>

              <div className="mt-3 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                <p className="text-2xl font-black tracking-tight text-brand-700 dark:text-brand-400">
                  {money(currentTeacherRate)}
                  <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    / buổi
                  </span>
                </p>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {money(hourlyRate)}/ giờ · 2 giờ mỗi buổi
                </p>
              </div>

              <button
                type="button"
                onClick={openSalary}
                className="mt-3 min-h-11 rounded-2xl bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                Cập nhật mức lương
              </button>
            </section>

            <section className={cardClass}>
              <h2 className="text-base font-black">Quy tắc tính</h2>

              <dl className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                <SettingRule
                  label="Dạy bù"
                  value={`${makeupHourlyPercent}% lương một giờ dạy`}
                />

                <SettingRule
                  label="Giám khảo"
                  value={`${money(settings.judgeRatePerSession)}/ lịch`}
                />

                <SettingRule
                  label="Trải nghiệm online"
                  value={`${money(
                    settings.trialOnlineRatePerStudent,
                  )} × số học sinh`}
                />

                <SettingRule
                  label="Trải nghiệm offline"
                  value={`${money(settings.trialOfflineBaseRate)} + ${money(
                    settings.trialOfflineBonusPerStudent,
                  )} × số học sinh`}
                />
              </dl>
            </section>
          </div>

          <div className="grid items-stretch gap-3 md:grid-cols-2">
          <CampusEditor campuses={data.campuses} onSave={data.editCampus} openAdd={openCampus} />
          <section className={cardClass}>
            <h2 className="text-base font-black">Lịch sử mức lương</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Mỗi buổi học dùng mức lương có hiệu lực vào ngày dạy.
            </p>
            <dl className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
              {[...settings.salaryHistory]
                .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
                .map((rate) => (
                  <SettingRule
                    key={rate.id || rate.effectiveDate}
                    label={`Từ ${rate.effectiveDate.split("-").reverse().join("/")}`}
                    value={`${money(rate.teacherRatePerSession)}/buổi`}
                  />
                ))}
            </dl>
          </section>
          </div>
        </>
      )}

      {tab === "data" && onPurgeCancelledExtras && cancelledExtraCount > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Dọn dữ liệu cũ
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Có {cancelledExtraCount} lịch đã hủy còn lưu trong dữ liệu.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                const confirmed = await confirmAction(
                  `Xóa vĩnh viễn ${cancelledExtraCount} lịch đã hủy?\n\nThao tác này không thể hoàn tác.`,
                );

                if (confirmed) {
                  onPurgeCancelledExtras();
                }
              }}
              className="shrink-0 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:text-red-300"
            >
              Xóa lịch đã hủy
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

function SettingRule({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
      <dt className="shrink-0 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </dt>

      <dd className="text-sm font-bold leading-relaxed text-slate-900 sm:text-right dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}
