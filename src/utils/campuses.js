export function normalizeCampus(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('vi');
}

export function mergeCampuses(...lists) {
  const campuses = new Map();

  lists.flat().forEach((value) => {
    if (typeof value !== 'string') return;

    const name = value.trim().replace(/\s+/g, ' ');
    const key = normalizeCampus(name);

    if (key && !campuses.has(key)) {
      campuses.set(key, name);
    }
  });

  return [...campuses.values()].sort((a, b) =>
    a.localeCompare(b, 'vi')
  );
}