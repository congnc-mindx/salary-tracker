import { useState } from 'react';
import useNow from '../../hooks/useNow';
import ModalShell from '../common/ModalShell';
import CalendarBoard from '../calendar/CalendarBoard';
import { buildAgenda, eventStart, shiftDay } from './agendaModel';
import { formatDateVN } from '../../utils/date';
import { getCourseTitle } from '../../utils/courseDisplay';
import { extraTypeLabel, getExtraHours } from '../../utils/extra';
import { money } from '../../utils/format';
import { isPersonalHoliday } from '../../utils/holidays';

const panel = 'min-w-0 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900';
const muted = 'text-xs text-slate-500 dark:text-slate-400';
const link = 'min-h-11 rounded-lg px-2 py-2 text-left text-sm font-bold text-brand-700 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-300 dark:hover:bg-slate-800';

function LimitedPanel({ title, description, items, limit, renderItem, empty, onExpand, children }) {
  return <section className={`${panel} flex flex-col`}>
    <h3 className="text-lg font-black">{title}</h3>
    <p className={`mt-1 ${muted}`}>{description}</p>
    <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
      {items.slice(0,limit).map(renderItem)}
      {!items.length && <p className="py-7 text-sm text-slate-500 dark:text-slate-400">{empty}</p>}
    </div>
    <div className="mt-auto pt-3">
      {items.length > limit && <button type="button" className={link} onClick={onExpand}>Còn {items.length-limit} mục · Xem tất cả {items.length} →</button>}
      {children}
    </div>
  </section>;
}

export default function OverviewAgenda({ overview, holidays, courses, calendarProps, onOpenCalendar, onEditHoliday }) {
  const now = useNow(15_000);
  const agenda = buildAgenda(overview.events, now);
  const [expanded, setExpanded] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const end = shiftDay(agenda.weeks[1].end, 0);
  const leave = holidays.filter(h => h.endDate >= agenda.today && h.startDate <= end)
    .sort((a,b) => a.startDate.localeCompare(b.startDate));
  const courseFor = item => courses.find(c => c.id === item.source?.courseId);
  function eventRow(item, showDate = false) {
    const course = courseFor(item);
    const hours = item.isExtra ? getExtraHours(item.source) : 2;
    const start = eventStart(item);
    const endTime = new Date(start + hours * 3600000).toLocaleTimeString('vi-VN', { timeZone:'Asia/Ho_Chi_Minh', hour:'2-digit',minute:'2-digit' });
    const inactive = ['covered','leave'].includes(item.status);
    const status = inactive ? (item.status === 'covered' ? 'Dạy thay bởi GV khác' : 'Nghỉ') : now >= start + hours*3600000 ? 'Đã qua giờ' : now >= start ? 'Đang diễn ra' : 'Sắp tới';
    return <button key={item.id} type="button" onClick={() => setSelectedDate(item.date)}
      className="flex min-h-20 w-full items-center gap-3 rounded-lg py-4 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-brand-500 dark:hover:bg-slate-800">
      <span className="w-14 shrink-0"><span className="block font-black">{item.time || 'Cả ngày'}</span><span className={muted}>{endTime}</span></span>
      <span className="min-w-0 flex-1">
        <span className="block break-words font-black">{course ? getCourseTitle(course) : item.title}</span>
        <span className={`mt-1 block ${muted}`}>
          {showDate && `${formatDateVN(item.date)} · `}
          {item.kind === 'class' ? `Buổi ${item.sessionNo}${course?.totalSessions ? `/${course.totalSessions}` : ''} · Lớp chính` : extraTypeLabel(item.kind)}
          {(course?.campus || item.source?.campus) && ` · ${course?.campus || item.source.campus}`}
        </span>
        {item.isExtra && <span className={`mt-1 block ${muted}`}>{money(item.amount)}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2"><span className="max-w-24 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{status}</span><span aria-hidden="true">›</span></span>
    </button>;
  }
  function leaveRow(holiday) {
    const course = courses.find(c => c.id === holiday.applyTo);
    return <button type="button" key={holiday.id} onClick={() => { setExpanded(null); onEditHoliday(holiday); }}
      className="flex min-h-24 w-full items-center justify-between gap-3 rounded-lg py-4 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-brand-500 dark:hover:bg-slate-800">
      <span className="min-w-0"><span className="block font-black">{isPersonalHoliday(holiday) ? 'Nghỉ cá nhân' : course ? getCourseTitle(course) : 'Lớp nghỉ'}</span>
        <span className={`mt-1 block ${muted}`}>{formatDateVN(holiday.startDate)}{holiday.endDate !== holiday.startDate && ` – ${formatDateVN(holiday.endDate)}`}</span>
        <span className={`mt-1 block break-words ${muted}`}>{holiday.note || 'Xem các buổi bị ảnh hưởng và cách điều chỉnh'}</span></span><span aria-hidden="true">›</span>
    </button>;
  }
  const blocks = {
    day: { title: `${agenda.isTomorrow ? 'Ngày mai' : 'Hôm nay'} · ${formatDateVN(agenda.target)}`, items: agenda.day, render: e => eventRow(e), description: `${agenda.day.length} ca · Xếp theo giờ bắt đầu` },
    milestones: { title: 'Mốc cần chú ý', items: agenda.milestones, render: e => eventRow(e,true), description: 'Buổi 5, 9 và 14 · Trong 14 ngày tới' },
    leave: { title: 'Ngày nghỉ và điều chỉnh', items: leave, render: leaveRow, description: `${formatDateVN(agenda.today)} – ${formatDateVN(end)}` },
    ...Object.fromEntries(agenda.weeks.map((w,i) => [`week${i}`, { title: i ? 'Lịch phát sinh tuần sau' : 'Lịch phát sinh tuần này', items:w.items, render:e => eventRow(e,true), description:`${formatDateVN(w.start)} – ${formatDateVN(w.end)}` }]))
  };
  function block(key, limit, empty, children) {
    const b = blocks[key];
    return <LimitedPanel key={key} {...b} limit={limit} renderItem={b.render} empty={empty} onExpand={() => setExpanded(key)}>{children}</LimitedPanel>;
  }
  const details = expanded && blocks[expanded];
  return <div className="space-y-5">
    <p className={muted}>Lịch sắp tới theo giờ Việt Nam · Từ 19:00 chuyển sang lịch ngày mai. Bộ chọn tháng phía trên áp dụng cho thu nhập.</p>
    <div className="grid items-stretch gap-5 xl:grid-cols-[1.4fr_1fr]">
      {block('day',4,'Không có ca dạy trong ngày này.',<>
        {agenda.next.length > 0 && <div className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-700"><p className={`${muted} font-bold`}>TIẾP THEO · {formatDateVN(agenda.next[0].date)}</p>{eventRow(agenda.next[0])}
          {agenda.next.length > 1 && <button className={link} onClick={() => setSelectedDate(agenda.next[0].date)}>Còn {agenda.next.length-1} ca · Xem lịch ngày này →</button>}</div>}
        <button type="button" className={link} onClick={() => onOpenCalendar(agenda.target)}>Mở lịch dạy tháng {Number(agenda.target.slice(5,7))} →</button>
      </>)}
      {block('milestones',4,'Chưa có mốc buổi 5, 9 hoặc 14 trong 14 ngày tới.')}
    </div>
    <div className="grid items-stretch gap-5 xl:grid-cols-3">
      {block('week0',3,'Không có lịch phát sinh trong tuần này.')}
      {block('week1',3,'Không có lịch phát sinh trong tuần sau.')}
      {block('leave',3,'Không có ngày nghỉ hoặc điều chỉnh trong khoảng này.')}
    </div>
    {details && <ModalShell title={details.title} description={`${details.items.length} mục · ${details.description}`} onClose={() => setExpanded(null)}><div className="divide-y divide-slate-200 dark:divide-slate-700">{details.items.map(details.render)}</div></ModalShell>}
    {selectedDate && <CalendarBoard key={selectedDate} {...calendarProps} detailsOnly initialDate={selectedDate} onCloseDate={() => setSelectedDate(null)} />}
  </div>;
}
