import { EventEmitter } from "events";

// ── Eventos del sistema ─────────────────────────────────────────────────────
export type MiDistritoEvents = {
  "report.created":       { reportId: number; districtId: number; authorUserId: number };
  "report.updated":       { reportId: number; districtId: number; changes: Record<string, unknown> };
  "report.resolved":      { reportId: number; districtId: number; resolvedBy: number };
  "report.confirmed":     { reportId: number; districtId: number; userId: number };
  "panic_alert.created":  { alertId: number; districtId: number; type: string; lat: number; lng: number };
  "missing_person.created": { missingId: number; districtId: number };
  "missing_person.found": { missingId: number; districtId: number };
  "user.registered":      { userId: number; districtId: number };
  "user.login":           { userId: number; districtId: number };
  "user.locked":          { userId: number; reason: string };
  "notification.sent":    { notificationId: number; userId: number; type: string };
  "audit.logged":         { userId: number; action: string; targetType: string; targetId: number };
};

type EventName = keyof MiDistritoEvents;
type EventPayload<K extends EventName> = MiDistritoEvents[K];

class TypedEventEmitter {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit<K extends EventName>(event: K, data: EventPayload<K>): boolean {
    return this.emitter.emit(event, data);
  }

  on<K extends EventName>(event: K, listener: (data: EventPayload<K>) => void | Promise<void>): void {
    this.emitter.on(event, listener as (...args: unknown[]) => void);
  }

  off<K extends EventName>(event: K, listener: (data: EventPayload<K>) => void | Promise<void>): void {
    this.emitter.off(event, listener as (...args: unknown[]) => void);
  }

  removeAllListeners(event?: string): void {
    this.emitter.removeAllListeners(event);
  }
}

export const events = new TypedEventEmitter();
