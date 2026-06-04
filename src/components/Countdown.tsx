"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // ISO string
  onClosed?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(targetDate: string): { timeLeft: TimeLeft | null; isClosed: boolean } {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const calcTimeLeft = () => {
      const diff = new Date(targetDate).getTime() - Date.now();

      if (diff <= 0) {
        setIsClosed(true);
        setTimeLeft(null);
        return;
      }

      setIsClosed(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calcTimeLeft();
    const interval = setInterval(calcTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeLeft, isClosed };
}

export default function Countdown({ targetDate, onClosed }: CountdownProps) {
  const { timeLeft, isClosed } = useCountdown(targetDate);

  useEffect(() => {
    if (isClosed && onClosed) onClosed();
  }, [isClosed, onClosed]);

  if (isClosed) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-lg font-bold text-red-600">¡Inscripciones cerradas!</p>
        <p className="text-sm text-red-500">El torneo ya comenzó.</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white text-center">
      <p className="text-sm font-medium opacity-90 mb-2">Las inscripciones cierran en:</p>
      <div className="flex items-center justify-center space-x-4">
        <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl font-bold">{String(timeLeft.days).padStart(2, "0")}</span>
          <p className="text-xs opacity-75">días</p>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, "0")}</span>
          <p className="text-xs opacity-75">horas</p>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <p className="text-xs opacity-75">min</p>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <p className="text-xs opacity-75">seg</p>
        </div>
      </div>
    </div>
  );
}
