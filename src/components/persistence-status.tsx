"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Health = {
  ok?: boolean;
  persistence?: {
    backend?: string;
    supabaseConfigured?: boolean;
    sessionsLoaded?: number;
  };
};

export function PersistenceStatus() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/v1/health")
        .then((r) => r.json())
        .then((j) => {
          if (!cancelled) setHealth(j);
        })
        .catch(() => {
          if (!cancelled) setHealth(null);
        });
    load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!health?.persistence) {
    return <Badge tone="mute">Persistence · probing</Badge>;
  }

  const sb = health.persistence.supabaseConfigured;
  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone={sb ? "ok" : "mute"}>
        {sb ? "Supabase live" : "File store"}
      </Badge>
      <Badge tone="mute">
        {health.persistence.backend} · {health.persistence.sessionsLoaded ?? 0}{" "}
        sessions
      </Badge>
    </div>
  );
}
