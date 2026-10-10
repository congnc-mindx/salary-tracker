import useTheme from '../../hooks/useTheme';
import Sidebar from '../layout/Sidebar';
import MobileTabs from '../layout/MobileTabs';
import MonthSwitcher from '../MonthSwitcher/MonthSwitcher';
import OverviewHeader from './OverviewHeader';
import TopCards from './TopCards';
import QuickBookPanel from './QuickBookPanel';
import RightPanel from './RightPanel';

const monthFilterTabs = ['makeup', 'judge', 'trial', 'salary'];

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  summary,
  actions,
  children,
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="min-w-0 flex-1 p-4 pb-28 lg:p-8 lg:pb-28 xl:pb-8">
          {activeTab === 'overview' && (
            <>
              <OverviewHeader
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                openTrial={actions.openTrial}
                isDark={isDark}
                toggleTheme={toggleTheme}
              />

              <TopCards
                expectedIncome={summary.expectedIncome}
                confirmedIncome={summary.confirmedIncome}
                waitingIncome={summary.waitingIncome}
                cancelledIncome={summary.cancelledIncome}
              />
            </>
          )}

          {monthFilterTabs.includes(activeTab) && (
            <div className="mb-5 flex justify-end">
              <MonthSwitcher
                month={selectedMonth}
                setMonth={setSelectedMonth}
              />
            </div>
          )}

          <div className="mt-5 grid gap-5 2xl:grid-cols-[1fr_410px]">
            <section className="min-w-0">
              {children}

              <QuickBookPanel
                openAddCourse={actions.openAddCourse}
                openMakeup={actions.openMakeup}
                openJudge={actions.openJudge}
                openTrial={actions.openTrial}
                openHoliday={actions.openHoliday}
              />
            </section>

            <RightPanel
              expectedIncome={summary.expectedIncome}
              teacherBreakdown={summary.teacherBreakdown}
              makeupBreakdown={summary.makeupBreakdown}
              judgeBreakdown={summary.judgeBreakdown}
              trialBreakdown={summary.trialBreakdown}
              upcomingFuture={summary.upcomingFuture}
              pastThisMonth={summary.pastThisMonth}
            />
          </div>
        </main>
      </div>

      <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}