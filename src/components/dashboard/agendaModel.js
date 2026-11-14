// All dashboard date boundaries follow the teaching timezone, not the device.
export function vietnamClock(now = Date.now()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(now)).map(p => [p.type, p.value]));
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const tomorrow = shiftDay(today, 1);
  return { today, tomorrow, target: Number(parts.hour) >= 19 ? tomorrow : today,
    isTomorrow: Number(parts.hour) >= 19 };
}
export function shiftDay(date, count) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
}
export function eventStart(item) {
  return Date.parse(`${item.date}T${item.time || '00:00'}:00+07:00`);
}
export function isTeaching(item) {
  return item.kind !== 'holiday' && !['leave', 'covered', 'cancelled'].includes(item.status);
}
export function buildAgenda(events, now = Date.now()) {
  const clock = vietnamClock(now);
  const sorted = [...events].sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const teaching = sorted.filter(isTeaching);
  const nextDate = teaching.find(e => e.date > clock.target)?.date;
  const weekday = new Date(`${clock.today}T00:00:00Z`).getUTCDay();
  const monday = shiftDay(clock.today, -((weekday + 6) % 7));
  return { ...clock,
    day: teaching.filter(e => e.date === clock.target),
    next: teaching.filter(e => e.date === nextDate),
    milestones: teaching.filter(e => e.kind === 'class' && [5,9,14].includes(Number(e.sessionNo)) && eventStart(e) >= now && e.date <= shiftDay(clock.today,13)),
    weeks: [0,7].map(offset => {
      const start = shiftDay(monday,offset), end = shiftDay(start,6);
      return { start, end, items: sorted.filter(e => e.isExtra && e.date >= start && e.date <= end) };
    }),
  };
}
