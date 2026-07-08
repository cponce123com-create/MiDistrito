import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });

  useEffect(() => {
    fetch(`/api/events/calendar/${id}`).then(r => r.json()).then(setEvent).catch(() => {});
  }, [id]);

  const handleRegister = async () => {
    await fetch(`/api/events/calendar/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setRegistered(true);
  };

  if (!event) return (
    <div className="p-4" style={{ color: "var(--md-muted)", display: "flex", alignItems: "center", gap: 10 }}>
      <div className="animate-spin h-5 w-5 border-2 border-[var(--md-primary)] border-t-transparent rounded-full" />
      Cargando...
    </div>
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.currentAttendees : Infinity;

  return (
    <div className="p-4">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded mb-4" />}
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--md-text)" }}>{event.title}</h1>
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--md-muted)" }}>
        <span>{formatDate(event.startDate)}</span>
        {event.startTime && <span>• {event.startTime}</span>}
        <span className="chip chip-info">{event.category}</span>
      </div>
      <p className="mb-4" style={{ color: "var(--md-text)" }}>{event.description}</p>
      {event.address && <p className="text-sm mb-1" style={{ color: "var(--md-muted)" }}>📍 {event.address}</p>}
      {event.organizerName && <p className="text-sm mb-1" style={{ color: "var(--md-muted)" }}>Organiza: {event.organizerName}</p>}
      {event.entryFee && <p className="text-sm mb-1" style={{ color: "var(--md-muted)" }}>Entrada: {event.entryFee}</p>}
      {event.website && <p className="mb-4"><a href={event.website} className="text-sm" style={{ color: "var(--md-info)" }}>Sitio web</a></p>}

      {event.registrationRequired && !registered && (
        <div className="card mt-4" style={{ padding: 16 }}>
          <h3 className="font-semibold mb-2" style={{ color: "var(--md-text)" }}>Registrarse</h3>
          {event.maxAttendees && <p className="text-xs mb-2" style={{ color: "var(--md-muted)" }}>{spotsLeft} cupos disponibles</p>}
          <div className="form-field mb-2">
            <div className="input-wrapper">
              <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="form-field mb-2">
            <div className="input-wrapper">
              <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-field mb-2">
            <div className="input-wrapper">
              <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <button onClick={handleRegister} className="btn-primary w-full justify-center">Registrarse</button>
        </div>
      )}
      {registered && <p className="mt-4 text-sm" style={{ color: "var(--md-success)" }}>✅ Te has registrado exitosamente.</p>}
    </div>
  );
}
