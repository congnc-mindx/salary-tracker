import useTheme from "../../hooks/useTheme";

import Sidebar from "../layout/Sidebar";
import MobileTabs from "../layout/MobileTabs";

import PageHeader from "./PageHeader";
import TopCards from "./TopCards";

const pageConfig = {
  overview: {
    title: "Tổng quan",
    subtitle: "Theo dõi lịch dạy và thu nhập dự kiến",
    showMonth: true,
    actionLabel: "Book lịch",
    actionKey: "openTeaching",
  },

  classes: {
    title: "Lớp học của tôi",
    showMonth: true,
    subtitle: "Quản lý lớp học và theo dõi tiến độ giảng dạy",
    actionLabel: "Thêm lớp",
    actionKey: "openAddCourse",
  },

  makeup: {
    title: "Lịch phát sinh",
    subtitle: "Quản lý lịch dạy bù, dạy thay, trải nghiệm và giám khảo",
    showMonth: true,
    actionLabel: "Book lịch",
    actionKey: "openTeaching",
  },

  holidays: {
    title: "Ngày nghỉ",
    showMonth: true,
    subtitle: "Theo dõi lịch nghỉ và các buổi học bị ảnh hưởng",
    actionLabel: "Thêm ngày nghỉ",
    actionKey: "openHoliday",
  },

  calendar: {title: "Lịch dạy", subtitle: "Theo dõi và điều chỉnh lịch giảng dạy", showMonth: true, actionLabel: "Book lịch", actionKey: "openTeaching"},
  reconcile: {title: "Đối soát bảng lương", subtitle: "Kiểm tra bảng lương theo từng tháng", showMonth: true, actionLabel: "Nhập bảng lương"},
  salary: {
    title: "Thống kê thu nhập",
    subtitle: "Tổng hợp thu nhập và ảnh hưởng của lịch nghỉ",
    showMonth: true,
  },

  reviews: {
    title: "Nhận xét",
    actionLabel: "Thêm bộ môn",
    actionKey: "openSubjectGroup",
    subtitle: "Nhận xét theo buổi học, mẫu nội dung và tổng kết cuối khóa",
  },

  settings: {
    title: "Cài đặt",
    subtitle: "Thiết lập mức lương và quản lý cơ sở giảng dạy",
    actionLabel: "Thêm cơ sở",
    actionKey: "openCampus",
  },
};

export default function DashboardLayout({
  userId,
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  summary,
  actions,
  onSignOut,
  children,
}) {
  const { isDark, toggleTheme } = useTheme();

  const page = pageConfig[activeTab] || {
    title: "Quản lý lịch dạy",
  };

  function openNotification(item) {
    setSelectedMonth(item.date.slice(0, 7));
    setActiveTab("calendar");
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="min-w-0 flex-1 p-4 pb-28 lg:p-5 2xl:p-8 lg:pb-28 xl:pb-8">
          <PageHeader
            title={page.title}
            subtitle={page.subtitle}
            showMonth={page.showMonth}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            actionLabel={page.actionLabel}
            onAction={activeTab === "reconcile" ? () => window.dispatchEvent(new Event("mindx:import-payroll")) : page.actionKey ? actions[page.actionKey] : undefined}
            isDark={isDark}
            toggleTheme={toggleTheme}
            notifications={summary.overview?.notifications ?? []}
            onOpenNotification={openNotification}
            onSignOut={onSignOut}
          />

          {activeTab === "overview" && (
            <div className="mb-5">
              <TopCards userId={userId} selectedMonth={selectedMonth}
                expectedIncome={summary.expectedIncome}
                confirmedIncome={summary.confirmedIncome}
                waitingIncome={summary.waitingIncome}
                leaveSummary={summary.leaveSummary}
              />
            </div>
          )}

          <div className="min-w-0">{children}</div>
        </main>
      </div>

      <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
