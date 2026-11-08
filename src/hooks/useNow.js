import { useEffect, useState } from "react";

// Refresh time-based lists after a timer tick, window focus or returning to a tab.
export default function useNow(interval = 60_000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const onVisible = () => { if (!document.hidden) refresh(); };
    const timer = window.setInterval(refresh, interval);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [interval]);
  return now;
}
