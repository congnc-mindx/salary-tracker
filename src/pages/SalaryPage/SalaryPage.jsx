import { useState } from "react";
import StatisticsOverview from "./StatisticsOverview";
import ReconciliationPage from "./reconciliation/ReconciliationPage";
export default function SalaryPage(props) {
  const [tab, setTab] = useState("statistics");
  return (
    <section>
      <nav aria-label="Chế độ thống kê" className="mb-5 flex gap-2">
        {[
          ["statistics", "Thống kê"],
          ["reconcile", "Đối soát bảng lương"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={`min-h-11 rounded-xl px-4 text-sm font-bold ${tab === key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div hidden={tab !== "statistics"}>
        <StatisticsOverview {...props} />
      </div>
      <ReconciliationPage {...props} active={tab === "reconcile"} />
    </section>
  );
}
