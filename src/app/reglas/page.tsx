import { Trophy, Target, ShieldCheck, DollarSign, Users } from "lucide-react";

export default function ReglasPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Reglas del Juego</h1>
        <p className="text-lg text-gray-600">Todo lo que necesitas saber para participar y ganar.</p>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Sistema de Puntuación</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ul className="space-y-4">
              <li className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div>
                  <p className="font-bold text-gray-900">Resultado Exacto</p>
                  <p className="text-sm text-gray-500">Aciertas el marcador exacto de ambos equipos.</p>
                </div>
                <span className="bg-blue-100 text-blue-700 font-extrabold px-4 py-2 rounded-lg text-xl">5 pts</span>
              </li>
              <li className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div>
                  <p className="font-bold text-gray-900">Ganador o Empate</p>
                  <p className="text-sm text-gray-500">Aciertas quién gana o si hay empate, pero no el marcador exacto.</p>
                </div>
                <span className="bg-blue-100 text-blue-700 font-extrabold px-4 py-2 rounded-lg text-xl">3 pts</span>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Sin Acierto</p>
                  <p className="text-sm text-gray-500">No aciertas ni el ganador ni el marcador.</p>
                </div>
                <span className="bg-gray-100 text-gray-500 font-extrabold px-4 py-2 rounded-lg text-xl">0 pts</span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold">Distribución del Pozo</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700 font-medium">1er Puesto</p>
              <p className="text-3xl font-extrabold text-yellow-800">60%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">2do Puesto</p>
              <p className="text-3xl font-extrabold text-gray-800">30%</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Acción Benéfica</p>
              <p className="text-3xl font-extrabold text-green-800">10%</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheck className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold">Transparencia y Cierres</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">!</span>
              </div>
              <p className="text-gray-600">
                Los pronósticos se cierran automáticamente <span className="font-bold text-gray-900">1 hora antes</span> del inicio de cada partido.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">!</span>
              </div>
              <p className="text-gray-600">
                Una vez cerrado un partido, las jugadas de todos los participantes se vuelven <span className="font-bold text-gray-900">públicas</span> en el portal de transparencia.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">!</span>
              </div>
              <p className="text-gray-600">
                En caso de empate en el ranking final, el criterio de desempate será: 1) Más marcadores exactos acertados, 2) Fecha de registro más temprana.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
