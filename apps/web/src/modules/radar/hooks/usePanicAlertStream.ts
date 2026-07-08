import { useEffect, useRef, useCallback } from "react";
import { useToast } from "../../../core/use-toast";
import { useDistrict } from "../../../core/DistrictContext";

export function usePanicAlertStream() {
  const { toast } = useToast();
  const { currentDistrictId } = useDistrict();
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastAlertRef = useRef<string>("");

  const playAlertSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const play = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(900, ctx.currentTime + 0.6);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.6);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
        osc2.start(ctx.currentTime + 0.6);
        osc2.stop(ctx.currentTime + 1.0);
      };
      if (ctx.state === "suspended") {
        ctx.resume().then(play).catch(() => {});
      } else {
        play();
      }
    } catch {
      // Audio not supported
    }
  }, []);

  useEffect(() => {
    if (!currentDistrictId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/panic-alerts/stream?districtId=${currentDistrictId}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.type) return;

        const alertKey = data.id + data.createdAt;
        if (alertKey === lastAlertRef.current) return;
        lastAlertRef.current = alertKey;

        playAlertSound();

        const typeMap: Record<string, string> = {
          robbery: "\uD83D\uDEA8 Robo",
          medical: "\uD83D\uDE91 Emergencia Médica",
          fight: "\u2694\uFE0F Pelea",
          fire: "\uD83D\uDD25 Incendio",
          missing_person: "\uD83D\uDD0D Persona Desaparecida",
          other: "\u26A0\uFE0F Alerta General",
        };

        toast({
          title: typeMap[data.type] || "\u26A0\uFE0F Alerta de Pánico",
          description: `${data.authorName} — ${data.address || data.sector || ""}`,
          variant: data.type === "robbery" || data.type === "fire" ? "destructive" as const : "default" as const,
        });
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {};

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [currentDistrictId, toast, playAlertSound]);
}
