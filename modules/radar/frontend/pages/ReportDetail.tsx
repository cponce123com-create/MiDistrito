import { useParams } from "react-router-dom";

export default function ReportDetail() {
  const { id } = useParams();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Reporte #{id}</h1>
      <p>Detalle del reporte (en construcción — Fase 1)</p>
    </div>
  );
}
