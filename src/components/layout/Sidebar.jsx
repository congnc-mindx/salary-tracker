import { GraduationCap } from 'lucide-react';
import clsx from 'clsx';

import { navigationItems } from '../../config/navigation';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="hidden w-[264px] shrink-0 border-r border-slate-200 bg-white/95 p-5 xl:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
          <GraduationCap size={25} />
        </div>

        <div>
          <h1 className="text-xl font-black">Thu nhập</h1>
          <p className="text-sm font-semibold text-slate-500">
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
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
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