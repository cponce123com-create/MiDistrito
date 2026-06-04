"use client";

interface PrizeBoardProps {
  entryFee: number;
  totalTickets: number;
  prizeFirstPct: number;
  prizeSecondPct: number;
  prizeThirdPct: number;
}

export default function PrizeBoard({
  entryFee,
  totalTickets,
  prizeFirstPct,
  prizeSecondPct,
  prizeThirdPct,
}: PrizeBoardProps) {
  const totalPot = entryFee * totalTickets;
  const firstPrize = (totalPot * prizeFirstPct) / 100;
  const secondPrize = (totalPot * prizeSecondPct) / 100;
  const thirdPrize = (totalPot * prizeThirdPct) / 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-4 text-center">
        <p className="text-sm font-medium opacity-90">POZO TOTAL</p>
        <p className="text-3xl font-extrabold">S/ {totalPot.toFixed(2)}</p>
        <p className="text-xs opacity-75 mt-1">
          {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} × S/ {entryFee.toFixed(2)}
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🥇</span>
            <div>
              <p className="font-bold text-gray-900">1° Lugar</p>
              <p className="text-xs text-gray-500">{prizeFirstPct}% del pozo</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-yellow-600">S/ {firstPrize.toFixed(2)}</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🥈</span>
            <div>
              <p className="font-bold text-gray-900">2° Lugar</p>
              <p className="text-xs text-gray-500">{prizeSecondPct}% del pozo</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-gray-600">S/ {secondPrize.toFixed(2)}</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🥉</span>
            <div>
              <p className="font-bold text-gray-900">3° Lugar</p>
              <p className="text-xs text-gray-500">{prizeThirdPct}% del pozo</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-orange-600">S/ {thirdPrize.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
