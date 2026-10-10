import { GraduationCap } from 'lucide-react';
import clsx from 'clsx';

import { navigationItems } from '../../config/navigation';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 self-start overflow-y-auto border-r border-slate-200 bg-white/95 p-5 text-slate-950 xl:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
          <GraduationCap size={25} />
        </div>

        <div>
          <h1 className="text-xl font-black">Thu nhập</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            mindX
          </p>
        </div>
      </div>

      <nav aria-label="Điều hướng chính" className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition-colors',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              <Icon size={20} />
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}