import clsx from "clsx";

import { mobileNavigationItems } from "../../config/navigation";

export default function MobileTabs({ activeTab, setActiveTab }) {
  return (
    <nav
      aria-label="Điều hướng trên điện thoại"
      className="fixed bottom-3 left-3 right-3 z-40 rounded-3xl bg-white p-2 shadow-2xl xl:hidden dark:bg-slate-900"
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${mobileNavigationItems.length}, minmax(0, 1fr))`,
        }}
      >
        {mobileNavigationItems.map((item) => {
          const Icon = item.mobileIcon || item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-black transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
                isActive ? "bg-brand-600 text-white hover:bg-brand-hover" : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              <Icon size={20} />
              <span>{item.mobileLabel || item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
