import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, ChevronLeft, ChevronRight, CircleHelp, Clock, Coins, Download, GraduationCap, Home, Landmark, Moon, Pencil, Plus, Save, Settings, Trash2, Users, Wallet, X, } from 'lucide-react';
import clsx from 'clsx';

// config
import {
  STORAGE_KEYS,
  defaultSettings,
} from "./config/income";

// utils
import {
  weekdayLabels,
  todayISO,
  currentMonthISO,
  formatDateVN,
  formatDateTimeVN,
  dateFromDateTime,
  timeFromDateTime,
  datetimeNowLocal,
  getNativeWeekday,
  getMondayIndex,
  getMonthLabel,
  nextMonth,
  prevMonth,
  getDaysInMonth,
} from "./utils/date";
import { money, statusText } from "./utils/format";
import { uid } from "./utils/id";

// services
import {
  readStorage,
  writeStorage,
} from "./services/storage";

import {
  getTeacherRateForDate,
  getDefaultStatusByDate,
  isPaidStatus,
  generateAllSchedules,
  getExtraAmount,
  getExtraRawAmount,
} from "./services/income";

// Components
import ModalShell from './components/common/ModalShell';
import Field from './components/common/Field';
import SelectField from './components/common/SelectField';

import ExtraWorkModal from './components/modals/ExtraWorkModal';
import SalaryRateModal from './components/modals/SalaryRateModal';

import MonthSwitcher from './components/MonthSwitcher/MonthSwitcher';

// Pages
import ClassesPage from './pages/ClassesPage/ClassesPage';
import MakeupPage from './pages/MakeupPage/MakeupPage';
import JudgePage from './pages/JudgePage/JudgePage';
import TrialsPage from './pages/TrialsPage/TrialsPage';
import HolidaysPage from './pages/HolidaysPage/HolidaysPage';
import SalaryPage from './pages/SalaryPage/SalaryPage';
import SettingsPage from "./pages/SettingsPage/SettingsPage";

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthISO());
  const [courses, setCourses] = useState(() => readStorage(STORAGE_KEYS.courses, []));
  const [holidays, setHolidays] = useState(() => readStorage(STORAGE_KEYS.holidays, []));
  const [overrides, setOverrides] = useState(() => readStorage(STORAGE_KEYS.overrides, []));
  const [extras, setExtras] = useState(() => readStorage(STORAGE_KEYS.extras, []));
  const [settings, setSettings] = useState(() => readStorage(STORAGE_KEYS.settings, defaultSettings));
  const [courseModal, setCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [holidayModal, setHolidayModal] = useState(false);
  const [extraModal, setExtraModal] = useState(null);
  const [salaryModal, setSalaryModal] = useState(false);
  useEffect(() => writeStorage(STORAGE_KEYS.courses, courses), [courses]);
  useEffect(() => writeStorage(STORAGE_KEYS.holidays, holidays), [holidays]);
  useEffect(() => writeStorage(STORAGE_KEYS.overrides, overrides), [overrides]);
  useEffect(() => writeStorage(STORAGE_KEYS.extras, extras), [extras]);
  useEffect(() => writeStorage(STORAGE_KEYS.settings, settings), [settings]);
  const { sessions, skippedHolidays } = useMemo(() => generateAllSchedules(courses, holidays, overrides, settings), [courses, holidays, overrides, settings]);
  const monthSessions = sessions.filter((item) => item.date.startsWith(selectedMonth));
  const monthSkipped = skippedHolidays.filter((item) => item.date.startsWith(selectedMonth));
  const monthExtras = extras.filter((item) => dateFromDateTime(item.datetime).startsWith(selectedMonth));
  const expectedTeacher = monthSessions
    .filter((item) => isPaidStatus(item.status))
    .reduce((sum, item) => sum + item.amount, 0);
  const confirmedTeacher = monthSessions
    .filter((item) => item.status === 'confirmed')
    .reduce((sum, item) => sum + item.amount, 0);
  const cancelledTeacher = monthSessions
    .filter((item) => item.status === 'cancelled')
    .reduce((sum, item) => sum + getTeacherRateForDate(settings, item.date), 0);
  const expectedExtra = monthExtras.reduce((sum, item) => sum + getExtraAmount(item, settings), 0);
  const confirmedExtra = monthExtras
    .filter((item) => item.status === 'confirmed')
    .reduce((sum, item) => sum + getExtraAmount(item, settings), 0);
  const cancelledExtra = monthExtras
    .filter((item) => item.status === 'cancelled')
    .reduce((sum, item) => sum + getExtraRawAmount(item, settings), 0);
  const expectedIncome = expectedTeacher + expectedExtra;
  const confirmedIncome = confirmedTeacher + confirmedExtra;
  const cancelledIncome = cancelledTeacher + cancelledExtra;
  const waitingIncome = expectedIncome - confirmedIncome;
  const teacherBreakdown = expectedTeacher;
  const makeupBreakdown = monthExtras
    .filter((item) => item.type === 'makeup')
    .reduce((sum, item) => sum + getExtraAmount(item, settings), 0);
  const judgeBreakdown = monthExtras
    .filter((item) => item.type === 'judge')
    .reduce((sum, item) => sum + getExtraAmount(item, settings), 0);
  const trialBreakdown = monthExtras
    .filter((item) => item.type === 'trial')
    .reduce((sum, item) => sum + getExtraAmount(item, settings), 0);
  const upcomingItems = [
    ...monthSessions.map((item) => ({
      id: item.key,
      date: item.date,
      time: item.startTime,
      title: item.courseCode,
      subtitle: `${item.startTime} - ${item.endTime}`,
      status: item.status,
      type: 'class',
    })),
    ...monthExtras.map((item) => ({
      id: item.id,
      date: dateFromDateTime(item.datetime),
      time: timeFromDateTime(item.datetime),
      title: item.type === 'trial'
        ? `Trial ${item.trialMode}`
        : item.type === 'judge'
          ? `Giám khảo · ${item.classCode}`
          : `Dạy bù · ${item.classCode}`,
      subtitle: `${formatDateTimeVN(item.datetime)}${item.type === 'trial' ? ` · ${item.studentCount || 0} HS` : ''}`,
      status: item.status,
      type: item.type,
    })),
  ]
    .filter((item) => item.status !== 'cancelled')
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const upcomingFuture = upcomingItems.filter((item) => item.date >= todayISO()).slice(0, 5);
  const pastThisMonth = upcomingItems.filter((item) => item.date < todayISO()).slice(-5).reverse();
  function openAddCourse() {
    setEditingCourse(null);
    setCourseModal(true);
  }
  function openEditCourse(course) {
    setEditingCourse(course);
    setCourseModal(true);
  }
  function saveCourse(data, id) {
    if (id) {
      setCourses((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
    }
    else {
      setCourses((prev) => [{ id: uid(), ...data }, ...prev]);
    }
    setCourseModal(false);
    setEditingCourse(null);
  }
  function deleteCourse(id) {
    const ok = confirm('Xóa lớp này? Lịch sinh từ lớp cũng sẽ biến mất.');
    if (!ok)
      return;
    setCourses((prev) => prev.filter((item) => item.id !== id));
    setOverrides((prev) => prev.filter((item) => !item.key.startsWith(`${id}-`)));
    setHolidays((prev) => prev.map((item) => (item.applyTo === id ? { ...item, applyTo: 'all' } : item)));
  }
  function addHoliday(data) {
    setHolidays((prev) => [{ id: uid(), ...data }, ...prev]);
    setHolidayModal(false);
  }
  function deleteHoliday(id) {
    setHolidays((prev) => prev.filter((item) => item.id !== id));
  }
  function addExtra(data) {
    setExtras((prev) => [{ id: uid(), ...data }, ...prev]);
    setExtraModal(null);
  }
  function updateExtraStatus(id, status) {
    setExtras((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }
  function deleteExtra(id) {
    setExtras((prev) => prev.filter((item) => item.id !== id));
  }
  function updateSessionStatus(key, status) {
    setOverrides((prev) => {
      const found = prev.find((item) => item.key === key);
      if (found) {
        return prev.map((item) => (item.key === key ? { ...item, status } : item));
      }
      return [...prev, { key, status }];
    });
  }
  function addSalaryRate(rate, effectiveDate) {
    setSettings((prev) => ({
      ...prev,
      salaryHistory: [
        ...prev.salaryHistory,
        {
          id: uid(),
          effectiveDate,
          teacherRatePerSession: rate,
        },
      ].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)),
    }));
    setSalaryModal(false);
  }
  const currentTeacherRate = getTeacherRateForDate(settings, todayISO());
  return (

    <div className="min-h-screen bg-[#f5f8fc] text-slate-950">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-[264px] shrink-0 border-r border-slate-200 bg-white/95 p-5 xl:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <GraduationCap size={25} />
            </div>
            <div>
              <h1 className="text-xl font-black">Thu nhập</h1>
              <p className="text-sm font-semibold text-slate-500">mindX</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SideTab active={activeTab === 'overview'} icon={<Home size={20} />} label="Tổng quan" onClick={() => setActiveTab('overview')} />
            <SideTab active={activeTab === 'classes'} icon={<Wallet size={20} />} label="Lớp học của tôi" onClick={() => setActiveTab('classes')} />
            <SideTab active={activeTab === 'makeup'} icon={<Clock size={20} />} label="Dạy bù" onClick={() => setActiveTab('makeup')} />
            <SideTab active={activeTab === 'judge'} icon={<Users size={20} />} label="Ban giám khảo" onClick={() => setActiveTab('judge')} />
            <SideTab active={activeTab === 'trial'} icon={<Landmark size={20} />} label="Dạy trải nghiệm" onClick={() => setActiveTab('trial')} />            <SideTab active={activeTab === 'holidays'} icon={<CalendarDays size={20} />} label="Ngày nghỉ" onClick={() => setActiveTab('holidays')} />
            <SideTab active={activeTab === 'salary'} icon={<Coins size={20} />} label="Thống kê" onClick={() => setActiveTab('salary')} />
            <SideTab active={activeTab === 'settings'} icon={<Settings size={20} />} label="Cài đặt" onClick={() => setActiveTab('settings')} />
          </nav>

          {/* <div className="mt-auto pt-10">
          <div className="rounded-3xl bg-blue-50 p-4">
            <p className="text-sm font-black text-blue-900">Mức lương GV</p>
            <p className="mt-2 text-2xl font-black text-blue-700">{money(currentTeacherRate)}</p>
            <p className="text-xs font-bold text-blue-700">/ca</p>
          </div>
        </div> */}
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-8">
          {activeTab === 'overview' && (
            <>
              <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-3xl font-black">
                    Tổng quan tháng {selectedMonth.slice(5)}/{selectedMonth.slice(0, 4)}
                  </h2>
                  <p className="mt-1 font-semibold text-slate-500">
                    Theo dõi lịch dạy và thu nhập dự kiến
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <MonthSwitcher
                    month={selectedMonth}
                    setMonth={setSelectedMonth}
                  />

                  <button
                    onClick={() => setSelectedMonth(currentMonthISO())}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm"
                  >
                    Hôm nay
                  </button>

                  <button
                    onClick={() => setExtraModal('trial')}
                    className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-200"
                  >
                    <Plus size={19} />
                    Book lịch
                  </button>

                  <IconButton>
                    <Bell size={20} />
                  </IconButton>
                  <IconButton>
                    <CircleHelp size={20} />
                  </IconButton>
                  <IconButton>
                    <Moon size={20} />
                  </IconButton>
                </div>
              </header>

              <TopCards
                expectedIncome={expectedIncome}
                confirmedIncome={confirmedIncome}
                waitingIncome={waitingIncome}
                cancelledIncome={cancelledIncome}
              />
            </>
          )}

          {['makeup', 'judge', 'trial', 'salary'].includes(activeTab) && (
            <div className="mb-5 flex justify-end">
              <MonthSwitcher
                month={selectedMonth}
                setMonth={setSelectedMonth}
              />
            </div>
          )}

          <div className="mt-5 grid gap-5 2xl:grid-cols-[1fr_410px]">
            <section className="min-w-0">
              {(activeTab === 'overview') && (<CalendarBoard selectedMonth={selectedMonth} sessions={monthSessions} skippedHolidays={monthSkipped} extras={monthExtras} settings={settings} updateSessionStatus={updateSessionStatus} updateExtraStatus={updateExtraStatus} deleteExtra={deleteExtra} />)}

              {activeTab === 'classes' && (<ClassesPage courses={courses} sessions={sessions} skippedHolidays={skippedHolidays} openAddCourse={openAddCourse} openEditCourse={openEditCourse} deleteCourse={deleteCourse} />)}
              
              {activeTab === 'makeup' && (<MakeupPage extras={monthExtras} settings={settings} openAdd={() => setExtraModal('makeup')} updateExtraStatus={updateExtraStatus} />)}

              {activeTab === 'judge' && (<JudgePage extras={monthExtras} settings={settings} openAdd={() => setExtraModal('judge')} updateExtraStatus={updateExtraStatus} />)}

              {activeTab === 'trial' && (<TrialsPage extras={monthExtras} settings={settings} openAdd={() => setExtraModal('trial')} updateExtraStatus={updateExtraStatus} />)}

              {activeTab === 'holidays' && (<HolidaysPage holidays={holidays} courses={courses} openAdd={() => setHolidayModal(true)} deleteHoliday={deleteHoliday} />)}

              {activeTab === 'salary' && (<SalaryPage sessions={monthSessions} extras={monthExtras} settings={settings} expectedIncome={expectedIncome} confirmedIncome={confirmedIncome} cancelledIncome={cancelledIncome} teacherBreakdown={teacherBreakdown} makeupBreakdown={makeupBreakdown} judgeBreakdown={judgeBreakdown} trialBreakdown={trialBreakdown} />)}

              {activeTab === 'settings' && (<SettingsPage settings={settings} currentTeacherRate={currentTeacherRate} openSalary={() => setSalaryModal(true)} />)}

              <QuickBookPanel openAddCourse={openAddCourse} openMakeup={() => setExtraModal('makeup')} openJudge={() => setExtraModal('judge')} openTrial={() => setExtraModal('trial')} openHoliday={() => setHolidayModal(true)} />
            </section>

            <RightPanel expectedIncome={expectedIncome} teacherBreakdown={teacherBreakdown} makeupBreakdown={makeupBreakdown} judgeBreakdown={judgeBreakdown} trialBreakdown={trialBreakdown} upcomingFuture={upcomingFuture} pastThisMonth={pastThisMonth} />
          </div>
        </main>
      </div>

      <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {courseModal && (<CourseModal course={editingCourse} currentRate={currentTeacherRate} onClose={() => {
        setCourseModal(false);
        setEditingCourse(null);
      }} onSave={saveCourse} />)}

      {holidayModal && (<HolidayModal courses={courses} onClose={() => setHolidayModal(false)} onSave={addHoliday} />)}

      {extraModal && (<ExtraWorkModal type={extraModal} settings={settings} onClose={() => setExtraModal(null)} onSave={addExtra} />)}

      {salaryModal && (<SalaryRateModal currentRate={currentTeacherRate} onClose={() => setSalaryModal(false)} onSave={addSalaryRate} />)}
    </div>);
}
function SideTab({ active, icon, label, badge, onClick, }) {
  return (<button onClick={onClick} className={clsx('flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition', active
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
    : 'text-slate-600 hover:bg-slate-100')}>
    {icon}
    <span className="flex-1">{label}</span>
    {badge && (<span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-black text-white">
      {badge}
    </span>)}
  </button>);
}
function IconButton({ children }) {
  return (<button className="hidden rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm lg:block">
    {children}
  </button>);
}
function TopCards({ expectedIncome, confirmedIncome, waitingIncome, cancelledIncome, }) {
  return (<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <MetricCard icon={<Wallet />} title="Thu nhập dự kiến" value={money(expectedIncome)} desc="Tổng thu nhập tháng" color="blue" />
    <MetricCard icon={<Save />} title="Đã xác nhận" value={money(confirmedIncome)} desc="Đã chắc chắn" color="green" />
    <MetricCard icon={<Clock />} title="Chờ xác nhận" value={money(waitingIncome)} desc="Dự kiến còn lại" color="orange" />
    <MetricCard icon={<X />} title="Hủy / Nghỉ" value={money(cancelledIncome)} desc="Khoản đã bị trừ" color="red" />
  </div>);
}
function MetricCard({ icon, title, value, desc, color, }) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-100',
    green: 'from-emerald-400 to-emerald-600 shadow-emerald-100',
    orange: 'from-orange-400 to-orange-500 shadow-orange-100',
    red: 'from-rose-400 to-rose-600 shadow-rose-100',
  };
  return (<div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className={clsx('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', colorMap[color])}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-black">{value}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">{desc}</p>
      </div>
    </div>
  </div>);
}

function CalendarBoard({ selectedMonth, sessions, skippedHolidays, extras, settings, updateSessionStatus, updateExtraStatus, deleteExtra, }) {
  const days = getDaysInMonth(selectedMonth);
  const blankCount = getMondayIndex(days[0]);
  return (<div>
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {weekdayLabels.map((item) => (<div key={item} className="p-5 text-center font-black text-slate-700">
          {item}
        </div>))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: blankCount }).map((_, index) => (<div key={`blank-${index}`} className="min-h-[118px] border-b border-r border-slate-100 bg-slate-50" />))}

        {days.map((date) => {
          const daySessions = sessions.filter((item) => item.date === date);
          const daySkipped = skippedHolidays.filter((item) => item.date === date);
          const dayExtras = extras.filter((item) => dateFromDateTime(item.datetime) === date);
          const isToday = date === todayISO();
          return (<div key={date} className={clsx('min-h-[118px] border-b border-r border-slate-100 p-3', isToday ? 'bg-blue-50' : 'bg-white', daySkipped.length > 0 && 'bg-rose-50')}>
            <div className={clsx('mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black', isToday ? 'bg-blue-600 text-white' : 'text-slate-700')}>
              {Number(date.slice(-2))}
            </div>

            <div className="space-y-1.5">
              {daySessions.slice(0, 3).map((item) => (<CalendarPill key={item.key} text={`${item.courseCode} · B${item.sessionNo}`} sub={item.startTime} status={item.status} kind="class" />))}

              {daySkipped.slice(0, 1).map((item) => (<CalendarPill key={item.id} text={item.title} status="cancelled" kind="holiday" />))}

              {dayExtras.slice(0, 3).map((item) => (<CalendarPill key={item.id} text={extraTitle(item)} sub={timeFromDateTime(item.datetime)} status={item.status} kind={item.type} />))}
            </div>
          </div>);
        })}
      </div>
    </div>

    <div className="mt-4 flex flex-wrap justify-center gap-5 text-sm font-bold text-slate-500">
      <Legend color="bg-emerald-500" label="Lớp học" />
      <Legend color="bg-blue-500" label="Dạy bù" />
      <Legend color="bg-purple-500" label="Giám khảo" />
      <Legend color="bg-orange-500" label="Trial" />
      <Legend color="bg-rose-500" label="Ngày nghỉ" />
    </div>

    <div className="mt-6 grid gap-5 xl:grid-cols-2">
      <div>
        <h3 className="mb-3 text-xl font-black">Buổi học trong tháng</h3>
        <div className="space-y-3">
          {sessions.map((item) => (<WorkRow key={item.key} title={`${item.courseCode} · Buổi ${item.sessionNo}`} subtitle={`${formatDateVN(item.date)} · ${item.startTime} - ${item.endTime}`} amount={isPaidStatus(item.status) ? money(item.amount) : 'Không tính'} status={item.status} onStatus={(status) => updateSessionStatus(item.key, status)} />))}
          {sessions.length === 0 && <Empty text="Tháng này chưa có buổi học nào." />}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xl font-black">Lịch phụ trong tháng</h3>
        <div className="space-y-3">
          {extras.map((item) => (<WorkRow key={item.id} title={extraTitle(item)} subtitle={extraSubtitle(item)} amount={money(getExtraAmount(item, settings))} status={item.status} onStatus={(status) => updateExtraStatus(item.id, status)} onDelete={() => deleteExtra(item.id)} />))}
          {extras.length === 0 && <Empty text="Chưa có dạy bù, giám khảo hoặc trial." />}
        </div>
      </div>
    </div>
  </div>);
}
function CalendarPill({ text, sub, status, kind, }) {
  const styles = {
    class: 'bg-emerald-50 text-emerald-800',
    makeup: 'bg-blue-50 text-blue-800',
    judge: 'bg-purple-50 text-purple-800',
    trial: 'bg-orange-50 text-orange-800',
    holiday: 'bg-rose-50 text-rose-800',
  };
  return (<div className={clsx('rounded-xl px-2.5 py-2 text-xs font-black', styles[kind], status === 'cancelled' && 'bg-rose-100 text-rose-800')}>
    <div className="truncate">{text}</div>
    {sub && <div className="mt-0.5 font-bold opacity-80">{sub}</div>}
  </div>);
}
function Legend({ color, label }) {
  return (<div className="flex items-center gap-2">
    <span className={clsx('h-3 w-3 rounded-full', color)} />
    {label}
  </div>);
}
function QuickBookPanel({ openAddCourse, openMakeup, openJudge, openTrial, openHoliday, }) {
  return (<div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/60 p-4">
    <div className="grid gap-3 md:grid-cols-5">
      <QuickBookButton icon={<Wallet />} label="Lớp học cố định" onClick={openAddCourse} />
      <QuickBookButton icon={<Clock />} label="Dạy bù" onClick={openMakeup} />
      <QuickBookButton icon={<Users />} label="Ban giám khảo" onClick={openJudge} />
      <QuickBookButton icon={<Landmark />} label="Dạy trải nghiệm" onClick={openTrial} />
      <QuickBookButton icon={<Settings />} label="Ngày nghỉ" onClick={openHoliday} />
    </div>
  </div>);
}
function QuickBookButton({ icon, label, badge, onClick, }) {
  return (<button onClick={onClick} className="relative flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3 font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="text-blue-600">{icon}</div>
    {label}
    {badge && <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">{badge}</span>}
  </button>);
}
function RightPanel({ expectedIncome, teacherBreakdown, makeupBreakdown, judgeBreakdown, trialBreakdown, upcomingFuture, pastThisMonth, }) {
  return (<aside className="space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-black">Phân bổ thu nhập dự kiến</h3>
      <div className="grid gap-3">
        <BreakdownLine color="bg-emerald-500" label="Lớp học" amount={teacherBreakdown} total={expectedIncome} />
        <BreakdownLine color="bg-blue-500" label="Dạy bù" amount={makeupBreakdown} total={expectedIncome} />
        <BreakdownLine color="bg-purple-500" label="Giám khảo" amount={judgeBreakdown} total={expectedIncome} />
        <BreakdownLine color="bg-orange-500" label="Trial" amount={trialBreakdown} total={expectedIncome} />
      </div>
      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-black text-blue-700">
        <Download size={18} />
        Xem chi tiết thống kê
      </button>
    </div>

    <SmallScheduleCard title="Lịch sắp tới" items={upcomingFuture} />
    <SmallScheduleCard title="Lịch trong quá khứ tháng này" items={pastThisMonth} />

    <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-4 font-black text-blue-700 shadow-sm">
      <Download size={18} />
      Xuất báo cáo tháng
    </button>
  </aside>);
}
function BreakdownLine({ color, label, amount, total, }) {
  const percent = total ? Math.round((amount / total) * 1000) / 10 : 0;
  return (<div>
    <div className="mb-1 flex items-center justify-between text-sm font-bold">
      <div className="flex items-center gap-2">
        <span className={clsx('h-3 w-3 rounded-full', color)} />
        {label}
      </div>
      <span>{money(amount)}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={clsx('h-full rounded-full', color)} style={{ width: `${percent}%` }} />
    </div>
    <p className="mt-1 text-xs font-bold text-slate-400">{percent}%</p>
  </div>);
}
function SmallScheduleCard({ title, items }) {
  return (<div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 p-5">
      <h3 className="font-black">{title}</h3>
      <button className="text-sm font-black text-blue-600">Xem tất cả</button>
    </div>
    <div className="space-y-1 p-3">
      {items.map((item) => (<div key={item.id} className="flex items-center justify-between rounded-2xl p-3 hover:bg-slate-50">
        <div>
          <p className="font-black">{item.title}</p>
          <p className="text-sm font-semibold text-slate-500">{item.subtitle}</p>
        </div>
        <span className={clsx('rounded-full px-3 py-1 text-xs font-black', item.status === 'confirmed' ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-700')}>
          {statusText(item.status)}
        </span>
      </div>))}
      {items.length === 0 && <p className="p-4 text-center text-sm font-semibold text-slate-400">Chưa có lịch.</p>}
    </div>
  </div>);
}

function WorkRow({ title, subtitle, amount, status, onStatus, onDelete, }) {
  const isCancelled = status === 'cancelled';
  return (<div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
        <p className="mt-2 font-black text-blue-700">{isCancelled ? 'Không tính' : amount}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={clsx('rounded-full px-4 py-2 text-sm font-black', status === 'confirmed' && 'bg-blue-600 text-white', status === 'planned' && 'bg-slate-100 text-slate-500', status === 'cancelled' && 'bg-red-100 text-red-700')}>
          {status === 'confirmed' ? 'Xác nhận' : status === 'planned' ? 'Dự kiến' : 'Đã hủy'}
        </span>

        {!isCancelled && (<button onClick={() => {
          onStatus('cancelled');
          onDelete?.();
        }} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500 hover:bg-red-50 hover:text-red-700">
          Hủy
        </button>)}
      </div>
    </div>
  </div>);
}

function Empty({ text }) {
  return (<div className="rounded-3xl border border-slate-200 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">
    {text}
  </div>);
}
function MobileTabs({ activeTab, setActiveTab, }) {
  const items = [
    { key: 'overview', label: 'Tổng quan', icon: <Home size={20} /> },
    { key: 'classes', label: 'Lớp', icon: <GraduationCap size={20} /> },
    { key: 'salary', label: 'Lương', icon: <Coins size={20} /> },
    { key: 'settings', label: 'Cài đặt', icon: <Settings size={20} /> },
  ];
  return (<div className="fixed bottom-3 left-3 right-3 z-40 rounded-3xl bg-white p-2 shadow-2xl xl:hidden">
    <div className="grid grid-cols-5 gap-1">
      {items.map((item) => (<button key={item.key} onClick={() => setActiveTab(item.key)} className={clsx('flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-black', activeTab === item.key ? 'bg-blue-600 text-white' : 'text-slate-500')}>
        {item.icon}
        {item.label}
      </button>))}
    </div>
  </div>);
}

function CourseModal({ course, onClose, onSave, }) {
  const [code, setCode] = useState(course?.code || 'SA55');
  const [startDate, setStartDate] = useState(course?.startDate || todayISO());
  const [weekday, setWeekday] = useState(String(course?.weekday ?? getNativeWeekday(todayISO())));
  const [startTime, setStartTime] = useState(course?.startTime || '19:30');
  function submit() {
    onSave({
      code: code.trim().toUpperCase(),
      startDate,
      weekday: Number(weekday),
      startTime,
      totalSessions: 14,
    }, course?.id);
  }
  return (<ModalShell title={course ? 'Sửa lớp học' : 'Thêm lớp học'} onClose={onClose}>
    <div className="space-y-4">
      <Field label="Tên / mã lớp" value={code} onChange={setCode} />
      <Field label="Ngày khai giảng" type="date" value={startDate} onChange={setStartDate} />

      <SelectField label="Thứ cố định" value={weekday} onChange={setWeekday} options={[
        { label: 'Thứ 2', value: '1' },
        { label: 'Thứ 3', value: '2' },
        { label: 'Thứ 4', value: '3' },
        { label: 'Thứ 5', value: '4' },
        { label: 'Thứ 6', value: '5' },
        { label: 'Thứ 7', value: '6' },
        { label: 'Chủ nhật', value: '0' },
      ]} />

      <Field label="Giờ bắt đầu" type="time" value={startTime} onChange={setStartTime} />

      <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white">
        <Save size={18} />
        Lưu lớp học
      </button>
    </div>
  </ModalShell>);
}
function HolidayModal({ courses, onClose, onSave, }) {
  const [title, setTitle] = useState('Nghỉ lễ');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [applyTo, setApplyTo] = useState('all');
  function submit() {
    onSave({
      title: title.trim() || 'Nghỉ',
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
      applyTo,
    });
  }
  return (<ModalShell title="Thêm ngày nghỉ" onClose={onClose}>
    <div className="space-y-4">
      <Field label="Tên ngày nghỉ" value={title} onChange={setTitle} />
      <Field label="Từ ngày" type="date" value={startDate} onChange={setStartDate} />
      <Field label="Đến ngày" type="date" value={endDate} onChange={setEndDate} />

      <SelectField label="Áp dụng cho" value={applyTo} onChange={setApplyTo} options={[
        { label: 'Tất cả lớp', value: 'all' },
        ...courses.map((course) => ({
          label: course.code,
          value: course.id,
        })),
      ]} />

      <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white">
        <Save size={18} />
        Lưu ngày nghỉ
      </button>
    </div>
  </ModalShell>);
}

function extraTitle(item) {
  if (item.type === 'makeup')
    return `Dạy bù · ${item.classCode}`;
  if (item.type === 'judge')
    return `Giám khảo · ${item.classCode}`;
  return `Trial ${item.trialMode} · ${item.studentCount || 0} HS`;
}
function extraSubtitle(item) {
  if (item.type === 'trial') {
    return `${formatDateTimeVN(item.datetime)} · ${item.campus || 'Chưa có cơ sở'}${item.note ? ` · ${item.note}` : ''}`;
  }
  if (item.type === 'makeup') {
    return `${formatDateTimeVN(item.datetime)} · ${item.hours || 0} giờ${item.note ? ` · ${item.note}` : ''}`;
  }
  return formatDateTimeVN(item.datetime);
}