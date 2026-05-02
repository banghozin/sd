"use client";

import { useEffect, useState } from "react";

function formatRelative(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

export function LastUpdated({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    // SSR / first render — render absolute time to avoid hydration mismatch
    return <span className="text-base font-semibold">—</span>;
  }

  const ms = now - new Date(iso).getTime();
  return (
    <span className="text-base font-semibold">{formatRelative(ms)}</span>
  );
}
