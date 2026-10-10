import { Clock, Landmark, Settings, Users, Wallet } from 'lucide-react';

export default function QuickBookPanel({
  openAddCourse,
  openMakeup,
  openJudge,
  openTrial,
  openHoliday,
}) {
  const actions = [
    {
      key: 'classes',
      label: 'Lớp học cố định',
      icon: Wallet,
      onClick: openAddCourse,
    },
    {
      key: 'makeup',
      label: 'Dạy bù',
      icon: Clock,
      onClick: openMakeup,
    },
    {
      key: 'judge',
      label: 'Ban giám khảo',
      icon: Users,
      onClick: openJudge,
    },
    {
      key: 'trial',
      label: 'Dạy trải nghiệm',
      icon: Landmark,
      onClick: openTrial,
    },
    {
      key: 'holidays',
      label: 'Ngày nghỉ',
      icon: Settings,
      onClick: openHoliday,
    },
  ];

  return (
    <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="grid gap-3 md:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className="relative flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3 font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-blue-600">
                <Icon />
              </span>
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}