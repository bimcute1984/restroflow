"use client";

import { useEffect, useRef } from "react";
import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtimeTable(
  table: string,
  onAnyChange: () => void
) {
  const callbackRef = useRef(onAnyChange);
  callbackRef.current = onAnyChange;

  useEffect(() => {
    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          callbackRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);
}
