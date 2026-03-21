import Link from "next/link";
import { Trophy, Users, ShieldCheck, Download, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-blue-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <Trophy className="h-16 w-16 mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Polla Deportiva 2024
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mb-10 leading-relaxed">
            Participa en la quiniela del Mundial, Libertadores y más. Demuestra tus conocimientos y gana el gran pozo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/registro"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              ¡Participar Ahora!
            </Link>
            <Link
              href="/pronosticos-publicos"
              className="bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-800 transition-colors border border-blue-500 shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Ver Pronósticos Públicos</span>
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-blue-50 p-4 rounded-full mb-6">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Ranking en Vivo</h3>
          <p className="text-gray-600">
            Sigue tu posición en tiempo real mientras se juegan los partidos. ¡Cada gol cuenta!
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-green-50 p-4 rounded-full mb-6">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Transparencia Total</h3>
          <p className="text-gray-600">
            Todas las jugadas son públicas una vez cerrados los pronósticos. Sin trampa ni cartón.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-purple-50 p-4 rounded-full mb-6">
            <Download className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Respaldo PDF</h3>
          <h3 className="text-xl font-bold mb-3">Respaldo PDF</h3>
          <p className="text-gray-600">
            Descarga tus pronósticos en PDF para tener tu propio comprobante de jugada.
          </p>
        </div>
      </section>

      {/* Rules Summary */}
      <section className="bg-gray-100 w-full py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cómo Funciona</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h4 className="font-bold text-lg">Regístrate y paga tu inscripción</h4>
                <p className="text-gray-600">Costo de inscripción: S/ 5. El 90% va al pozo y el 10% a acción benéfica.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h4 className="font-bold text-lg">Ingresa tus pronósticos</h4>
                <p className="text-gray-600">Predice el marcador de cada partido. Tienes hasta 1 hora antes de cada inicio.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h4 className="font-bold text-lg">Suma puntos</h4>
                <p className="text-gray-600">Marcador exacto: 5 pts. Acertar ganador/empate: 3 pts. Otros: 0 pts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
