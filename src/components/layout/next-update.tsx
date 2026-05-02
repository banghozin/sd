"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Schedule =
  | { kind: "every-30-min-during-us-market" }
  | { kind: "hourly-at-minute"; minute: number }
  | { kind: "daily-at-utc"; hour: number; minute: number }
  | { kind: "every-6-hours-at-minute"; minute: number };

type Props = {
  schedule: Schedule;
  label?: string;
  className?: string;
};

// US regular market hours in UTC during DST: 13:30–20:00 (EDT).
// During EST (Nov–Mar): 14:30–21:00. cron-job.org schedule we use is
// `*/30 13-21 * * 1-5` so we approximate that window here.
function nextUSMarket30Min(now: Date): Date {
  const probe = new Date(now);
  // Round up to the next :00 or :30 within UTC 13:00–21:30 on weekdays
  for (let i = 0; i < 60 * 24 * 4; i++) {
    probe.setUTCSeconds(0, 0);
    const m = probe.getUTCMinutes();
    if (m < 30) probe.setUTCMinutes(30);
    else {
      probe.setUTCMinutes(0);
      probe.setUTCHours(probe.getUTCHours() + 1);
    }
    const day = probe.getUTCDay(); // 0=Sun ... 6=Sat
    const h = probe.getUTCHours();
    const inWindow = h >= 13 && (h < 21 || (h === 21 && probe.getUTCMinutes() === 30));
    const isWeekday = day >= 1 && day <= 5;
    if (probe > now && inWindow && isWeekday) return probe;
  }
  return new Date(now.getTime() + 60 * 60 * 1000);
}

function nextHourlyAt(now: Date, minute: number): Date {
  const next = new Date(now);
  next.setUTCSeconds(0, 0);
  next.setUTCMinutes(minute);
  if (next <= now) next.setUTCHours(next.getUTCHours() + 1);
  return next;
}

function nextDailyAtUTC(now: Date, hour: number, minute: number): Date {
  const next = new Date(now);
  next.setUTCSeconds(0, 0);
  next.setUTCHours(hour);
  next.setUTCMinutes(minute);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function nextEvery6HoursAt(now: Date, minute: number): Date {
  for (let i = 0; i < 24; i++) {
    const probe = new Date(now);
    probe.setUTCSeconds(0, 0);
    probe.setUTCMinutes(minute);
    probe.setUTCHours(Math.ceil((now.getUTCHours() + i) / 6) * 6);
    if (probe > now && probe.getUTCHours() % 6 === 0) return probe;
  }
  return new Date(now.getTime() + 6 * 60 * 60 * 1000);
}

function computeNext(schedule: Schedule, now: Date): Date {
  switch (schedule.kind) {
    case "every-30-min-during-us-market":
      return nextUSMarket30Min(now);
    case "hourly-at-minute":
      return nextHourlyAt(now, schedule.minute);
    case "daily-at-utc":
      return nextDailyAtUTC(now, schedule.hour, schedule.minute);
    case "every-6-hours-at-minute":
      return nextEvery6HoursAt(now, schedule.minute);
  }
}

function format(remainingMs: number): string {
  if (remainingMs <= 0) return "갱신 중";
  const totalSec = Math.floor(remainingMs / 1000);
  const hr = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  if (hr > 0) return `${hr}시간 ${min}분 후`;
  if (min > 0) return `${min}분 ${sec.toString().padStart(2, "0")}초 후`;
  return `${sec}초 후`;
}

export function NextUpdate({ schedule, label = "다음 갱신", className }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted-foreground md:text-sm",
          className,
        )}
      >
        <Clock className="h-3.5 w-3.5" />
        <span>—</span>
      </span>
    );
  }

  const next = computeNext(schedule, now);
  const remaining = next.getTime() - now.getTime();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground md:text-sm",
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>
        {label} {format(remaining)}
      </span>
    </span>
  );
}
