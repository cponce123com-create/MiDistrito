import { useAuth } from "../../../../apps/web/src/core/AuthContext";
import { useDistrict } from "../../../../apps/web/src/core/DistrictContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const { currentDistrict, districtInfo } = useDistrict();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">MiDistrito — {currentDistrict}</h1>
      {!user ? (
        <p>Inicia sesión para reportar incidencias.</p>
      ) : (
        <p>Bienvenido, {user.name}!</p>
      )}
      <div className="mt-4 space-y-2">
        <Link to="/reportar" className="block px-4 py-2 bg-blue-600 text-white rounded">Reportar incidencia</Link>
        <Link to="/alertas" className="block px-4 py-2 bg-red-600 text-white rounded">Alertas de pánico</Link>
        <Link to="/desaparecidos" className="block px-4 py-2 bg-yellow-600 text-white rounded">Personas desaparecidas</Link>
      </div>
    </div>
  );
}
