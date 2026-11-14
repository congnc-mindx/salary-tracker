// Derived display/accounting status only: never writes completion to Firestore.
export function completeElapsedExtra(item, hours, now) {
  const end = new Date(item.datetime).getTime() + hours * 3600000;
  if (item.status !== "planned" || !Number.isFinite(end) || hours <= 0 || end > now) return item;
  return { ...item, status: "confirmed", autoCompleted: true };
}
