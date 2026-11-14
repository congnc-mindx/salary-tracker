import { useState } from "react";
import StatisticsOverview from "./StatisticsOverview";
import ReconciliationPage from "./reconciliation/ReconciliationPage";
export default function SalaryPage(props) {
  const [tab, setTab] = useState("month");
  return (
    <section>
      <nav aria-label="Chế độ thống kê" className="mb-5 grid grid-cols-3 gap-2 sm:flex">
        {[
          ["month", "Theo tháng"],
          ["year", "Theo năm"],
          ["reconcile", "Đối soát"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={`min-h-11 rounded-xl px-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-4 sm:text-sm ${tab === key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab !== "reconcile" && <StatisticsOverview key={tab + props.selectedMonth} {...props} mode={tab}
        onSelectMonth={(month) => { props.onSelectMonth?.(month); setTab("month"); }} /> }
      <ReconciliationPage {...props} active={tab === "reconcile"} />
    </section>
  );
}
