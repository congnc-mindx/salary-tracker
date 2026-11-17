/** Shared date, time-range and teaching-type tile. */
const tones = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
};
export default function TimeBadge({ primary, secondary, tone = 'blue', date = false, label = false }) {
  return <span className={`flex min-h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center ${tones[tone] || tones.blue}`}>
    <span className={`${date ? 'text-2xl' : label ? 'text-sm' : 'text-xs'} font-black tabular-nums leading-tight ${label ? 'whitespace-pre-line break-all' : 'whitespace-nowrap'}`}>{primary}</span>
    {secondary != null && <span className={"text-xs whitespace-nowrap font-black tabular-nums leading-tight"}>{secondary}</span>}
  </span>;
}
