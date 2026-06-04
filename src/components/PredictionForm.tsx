"use client";

import { useState } from "react";

interface Props {
  matchId: string;
  initialHome?: number;
  initialAway?: number;
  isLocked: boolean;
}

export default function PredictionForm({ matchId, initialHome, initialAway, isLocked }: Props) {
  const [home, setHome] = useState(initialHome ?? 0);
  const [away, setAway] = useState(initialAway ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore: home, awayScore: away }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (isLocked) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-400 tabular-nums">
          {initialHome ?? "?"} - {initialAway ?? "?"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setHome(Math.max(0, home - 1))}
          className="w-8 h-8 bg-gray-100 rounded-l-lg hover:bg-gray-200 font-bold text-gray-600"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          max={20}
          value={home}
          onChange={(e) => setHome(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
          className="w-12 h-8 text-center border-y font-bold tabular-nums text-lg outline-none"
        />
        <button
          type="button"
          onClick={() => setHome(Math.min(20, home + 1))}
          className="w-8 h-8 bg-gray-100 rounded-r-lg hover:bg-gray-200 font-bold text-gray-600"
        >
          +
        </button>
      </div>

      <span className="text-gray-400 font-bold">:</span>

      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setAway(Math.max(0, away - 1))}
          className="w-8 h-8 bg-gray-100 rounded-l-lg hover:bg-gray-200 font-bold text-gray-600"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          max={20}
          value={away}
          onChange={(e) => setAway(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
          className="w-12 h-8 text-center border-y font-bold tabular-nums text-lg outline-none"
        />
        <button
          type="button"
          onClick={() => setAway(Math.min(20, away + 1))}
          className="w-8 h-8 bg-gray-100 rounded-r-lg hover:bg-gray-200 font-bold text-gray-600"
        >
          +
        </button>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          saved
            ? "bg-green-100 text-green-700"
            : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        }`}
      >
        {saving ? "..." : saved ? "✓" : "Guardar"}
      </button>
    </div>
  );
}
