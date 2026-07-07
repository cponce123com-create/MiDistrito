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

  if (!event) return <div className="p-4 text-gray-400">Cargando...</div>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.currentAttendees : Infinity;

  return (
    <div className="p-4">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded mb-4" />}
      <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span>{formatDate(event.startDate)}</span>
        {event.startTime && <span>• {event.startTime}</span>}
        <span className="px-1.5 py-0.5 bg-gray-700 rounded capitalize">{event.category}</span>
      </div>
      <p className="text-gray-300 mb-4">{event.description}</p>
      {event.address && <p className="text-sm text-gray-400 mb-1">📍 {event.address}</p>}
      {event.organizerName && <p className="text-sm text-gray-400 mb-1">Organiza: {event.organizerName}</p>}
      {event.entryFee && <p className="text-sm text-gray-400 mb-1">Entrada: {event.entryFee}</p>}
      {event.website && <p className="mb-4"><a href={event.website} className="text-blue-400 underline text-sm">Sitio web</a></p>}

      {event.registrationRequired && !registered && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Registrarse</h3>
          {event.maxAttendees && <p className="text-xs text-gray-400 mb-2">{spotsLeft} cupos disponibles</p>}
          <input placeholder="Nombre" className="w-full p-2 mb-2 bg-gray-700 rounded text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" className="w-full p-2 mb-2 bg-gray-700 rounded text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Teléfono" className="w-full p-2 mb-2 bg-gray-700 rounded text-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button onClick={handleRegister} className="w-full py-2 bg-blue-600 rounded text-sm font-medium">Registrarse</button>
        </div>
      )}
      {registered && <p className="mt-4 text-green-400 text-sm">✅ Te has registrado exitosamente.</p>}
    </div>
  );
}
