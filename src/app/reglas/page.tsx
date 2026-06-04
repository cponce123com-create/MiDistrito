import { Trophy, Target, CheckCircle2, XCircle } from "lucide-react";

export default function ReglasPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Reglas del Juego</h1>
      <p className="text-gray-500 mb-8">Sistema de puntuación de la Polla Mundial 2026</p>

      <div className="bg-white rounded-xl shadow-md border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-500" /> Sistema de Puntos
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-800">Resultado Exacto — 3 puntos</h3>
              <p className="text-sm text-green-700">Aciertas el marcador exacto del partido. Ej: Pronosticas 2-1 y el resultado es 2-1.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-800">Diferencia Correcta — 2 puntos</h3>
              <p className="text-sm text-blue-700">Aciertas la diferencia de goles pero no el marcador exacto. Ej: Pronosticas 3-1 y el resultado es 2-0 (ambos tienen diferencia de 2).</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-800">Ganador Correcto — 1 punto</h3>
              <p className="text-sm text-yellow-700">Aciertas qué equipo gana o si es empate, pero no la diferencia. Ej: Pronosticas 2-0 y el resultado es 1-0.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
            <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800">Sin Puntos — 0 puntos</h3>
              <p className="text-sm text-red-700">No aciertas ni el ganador ni la diferencia.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Reglas Generales</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            Los pronósticos se cierran <strong>5 minutos antes</strong> del inicio de cada partido.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            Puedes modificar tus pronósticos en cualquier momento antes del cierre.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            Los puntos se calculan automáticamente cuando el administrador ingresa el resultado real.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            El ranking se actualiza en tiempo real después de cada partido.
          </li>
        </ul>
      </div>
    </div>
  );
}
