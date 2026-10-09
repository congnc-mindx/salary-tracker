import { money } from '../../utils/format';

export default function SettingsPage({
  settings,
  currentTeacherRate,
  openSalary,
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-black">Cài đặt</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-500">
            Lương giáo viên hiện tại
          </p>

          <p className="mt-2 text-3xl font-black text-blue-700">
            {money(currentTeacherRate)}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {money(currentTeacherRate / 2)} / giờ
          </p>

          <button
            type="button"
            onClick={openSalary}
            className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white"
          >
            Cập nhật mức lương
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-500">
            Quy tắc tính
          </p>

          <div className="mt-4 space-y-3">
            <SettingRule
              label="Dạy bù"
              value={`${settings.makeUpRatio * 100}% lương GV / giờ`}
            />

            <SettingRule
              label="Giám khảo"
              value={`${money(settings.judgeRatePerSession)} / lịch`}
            />

            <SettingRule
              label="Trial ONL"
              value={`${money(settings.trialOnlineRatePerStudent)} × số học sinh`}
            />

            <SettingRule
              label="Trial OFF"
              value={`${money(settings.trialOfflineBaseRate)} + ${money(
                settings.trialOfflineBonusPerStudent
              )} × số học sinh`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingRule({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <p className="font-bold text-slate-600">{label}</p>
      <p className="text-right font-black">{value}</p>
    </div>
  );
}