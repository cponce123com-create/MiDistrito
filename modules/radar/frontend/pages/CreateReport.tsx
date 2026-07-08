import { useState } from "react";

export default function CreateReport() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: enviar reporte
  };

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Reportar incidencia
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-field">
          <label htmlFor="report-title">Título del reporte</label>
          <div className="input-wrapper">
            <input
              id="report-title"
              type="text"
              placeholder="Ej: Bache en la Av. Principal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="report-desc">Descripción</label>
          <div className="input-wrapper" style={{ height: "auto", padding: "10px 14px", alignItems: "flex-start" }}>
            <textarea
              id="report-desc"
              placeholder="Describe el problema con detalle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "var(--md-text)",
                fontFamily: "var(--font-sans)",
                background: "transparent",
                resize: "vertical",
                minHeight: 100,
              }}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="report-cat">Categoría</label>
          <div className="input-wrapper" style={{ padding: 0 }}>
            <select
              id="report-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                flex: 1,
                height: 46,
                border: "none",
                outline: "none",
                fontSize: 14,
                color: category ? "var(--md-text)" : "#8A948F",
                fontFamily: "var(--font-sans)",
                background: "transparent",
                padding: "0 14px",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>Seleccionar categoría</option>
              <option value="vial">Problema vial</option>
              <option value="alumbrado">Alumbrado público</option>
              <option value="basura">Recojo de basura</option>
              <option value="seguridad">Seguridad</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
          Enviar reporte
        </button>
      </form>
    </div>
  );
}
