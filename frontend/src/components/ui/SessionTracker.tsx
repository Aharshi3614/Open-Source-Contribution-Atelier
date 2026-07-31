import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export function SessionTracker() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Only increment if the tab is active
      if (document.visibilityState === "visible") {
        setSeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 sm:border-4 border-black shadow-card text-xs sm:text-sm font-black uppercase tracking-wider text-text dark:bg-[#151411] dark:border-[#2e2924] dark:text-[#f0ebe2] dark:shadow-none hover:-translate-y-1 transition-transform"
      title="Time Spent Coding this session"
    >
      <Timer size={14} className="text-primary animate-pulse shrink-0" />
      <span className="font-mono">{formatTime(seconds)}</span>
    </div>
  );
}
