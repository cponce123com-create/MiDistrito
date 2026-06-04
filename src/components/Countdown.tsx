"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("¡COMENZÓ!");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-4 text-center">
      <p className="text-sm font-medium opacity-90 mb-1">Próximo partido:</p>
      <p className="text-3xl font-bold tabular-nums tracking-wider">{timeLeft}</p>
    </div>
  );
}
