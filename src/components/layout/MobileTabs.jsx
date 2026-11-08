import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import ModalShell from "../common/ModalShell";
import clsx from "clsx";

import { navigationItems, mobileNavigationItems } from "../../config/navigation";

export default function MobileTabs({ activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryItems = mobileNavigationItems.filter((item) => item.key !== "settings");
  const moreItems = navigationItems.filter((item) => !primaryItems.some((primary) => primary.key === item.key));
  const moreActive = moreItems.some((item) => item.key === activeTab);
  return (
    <>
    <nav
      aria-label="Điều hướng trên điện thoại"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-40 rounded-3xl bg-white p-2 shadow-2xl xl:hidden dark:bg-slate-900"
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${primaryItems.length + 1}, minmax(0, 1fr))`,
        }}
      >
        {primaryItems.map((item) => {
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
        <button type="button" onClick={() => setMenuOpen(true)} aria-haspopup="dialog"
          aria-label="Mở thêm trang" aria-expanded={menuOpen}
          className={clsx("flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-xs font-black",
            moreActive ? "bg-brand-600 text-white" : "text-slate-500 dark:text-slate-300")}>
          <MoreHorizontal size={20} /><span>Thêm</span>
        </button>
      </div>
    </nav>
    {menuOpen && <ModalShell title="Thêm trang" onClose={() => setMenuOpen(false)}>
      <div className="grid gap-2">
        {moreItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.key} type="button" aria-current={activeTab === item.key ? "page" : undefined}
            onClick={() => { setActiveTab(item.key); setMenuOpen(false); }}
            className={clsx("flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left font-bold",
              activeTab === item.key ? "bg-brand-600 text-white" : "bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700")}>
            <Icon size={20} />{item.label}
          </button>;
        })}
      </div>
    </ModalShell>}
    </>
  );
}
