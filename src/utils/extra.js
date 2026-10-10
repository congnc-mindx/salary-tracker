import { formatDateTimeVN } from './date';

export function extraTitle(item) {
  if (item.type === 'makeup') {
    return `Dạy bù · ${item.classCode}`;
  }

  if (item.type === 'judge') {
    return `Giám khảo · ${item.classCode}`;
  }

  return `Trial ${item.trialMode} · ${item.studentCount || 0} HS`;
}

export function extraSubtitle(item) {
  const datetime = formatDateTimeVN(item.datetime);
  const note = item.note ? ` · ${item.note}` : '';

  if (item.type === 'trial') {
    return `${datetime} · ${item.campus || 'Chưa có cơ sở'}${note}`;
  }

  if (item.type === 'makeup') {
    return `${datetime} · ${item.hours || 0} giờ${note}`;
  }

  return datetime;
}