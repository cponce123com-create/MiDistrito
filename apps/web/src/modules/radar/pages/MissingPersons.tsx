export default function MissingPersons() {
  const persons = [
    { id: 1, name: "Carlos Mendoza", age: 34, location: "San Martín de Porres", date: "12/03/2025" },
    { id: 2, name: "María López", age: 28, location: "Los Olivos", date: "10/03/2025" },
    { id: 3, name: "José García", age: 56, location: "Comas", date: "08/03/2025" },
    { id: 4, name: "Ana Torres", age: 22, location: "Independencia", date: "06/03/2025" },
  ];

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Personas desaparecidas
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {persons.map((p) => (
          <div key={p.id} className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                height: 100,
                background: "linear-gradient(135deg, var(--md-primary-50) 0%, #D1EDE8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: "var(--md-primary-700)",
                fontWeight: 700,
              }}
            >
              {p.name.charAt(0)}
            </div>
            <div style={{ padding: 10 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "var(--md-text)" }}>{p.name}</p>
              <p style={{ margin: "2px 0", fontSize: 12, color: "var(--md-muted)" }}>{p.age} años</p>
              <p style={{ margin: "2px 0", fontSize: 12, color: "var(--md-muted)" }}>{p.location}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--md-muted)" }}>Desapareció: {p.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
