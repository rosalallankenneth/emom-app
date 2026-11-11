
"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { ExerciseSession } from "./exercise-analytics/analytics-utils";
import { formatDate } from "./exercise-analytics/analytics-utils";

type ActivityDay = {
  date: string;
  count: number;
  minutes: number;
  level: number;
  future: boolean;
};

function ActivityTooltip({
  day,
  anchor,
}: {
  day: ActivityDay;
  anchor: HTMLElement;
}) {
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    below: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const halfTooltipWidth = Math.min(112, (window.innerWidth - 24) / 2);
      const center = rect.left + rect.width / 2;
      const left = Math.max(
        halfTooltipWidth + 12,
        Math.min(window.innerWidth - halfTooltipWidth - 12, center),
      );
      const below = rect.top < 100;

      setPosition({
        left,
        top: below ? rect.bottom + 8 : rect.top - 8,
        below,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchor]);

  if (!position) return null;

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[100] w-max max-w-[calc(100vw-24px)] rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg"
      style={{
        left: position.left,
        top: position.top,
        transform: position.below
          ? "translateX(-50%)"
          : "translate(-50%, -100%)",
      }}
    >
      <p className="font-medium">{formatDate(day.date)}</p>
      <p className="mt-1 text-muted">
        {day.future
          ? "Upcoming date"
          : `${day.minutes} min trained · ${day.count} ${
              day.count === 1 ? "session" : "sessions"
            }`}
      </p>
    </div>,
    document.body,
  );
}

export default function TrainingActivityCalendar({
  sessions,
}: {
  sessions: ExerciseSession[];
}) {
  const [activeTooltip, setActiveTooltip] = useState<{
    day: ActivityDay;
    anchor: HTMLElement;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollLeft = container.scrollWidth;
  }, []);

  const calendar = useMemo(() => {
    const today = new Date();
    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const end = new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ),
    );

    // Complete the final week through Saturday.
    end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

    // Start on Sunday, approximately 12 months earlier.
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 363);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const activity = new Map<
      string,
      { count: number; minutes: number }
    >();

    for (const session of sessions) {
      const current = activity.get(session.workoutDate) ?? {
        count: 0,
        minutes: 0,
      };

      current.count += 1;
      current.minutes += session.durationMinutes;
      activity.set(session.workoutDate, current);
    }

    const days: ActivityDay[] = [];

    for (
      const date = new Date(start);
      date <= end;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      const key = date.toISOString().slice(0, 10);
      const value = activity.get(key) ?? { count: 0, minutes: 0 };

      days.push({
        date: key,
        ...value,
        level:
          value.minutes === 0
            ? 0
            : value.minutes < 20
              ? 1
              : value.minutes < 30
                ? 2
                : 3,
        future: key > todayKey,
      });
    }

    const weeks: ActivityDay[][] = [];

    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7));
    }

    const monthLabels: { label: string; column: number }[] = [];
    let previousMonth = -1;

    weeks.forEach((week, column) => {
      const firstDay = week[0];
      if (!firstDay) return;

      const date = new Date(`${firstDay.date}T00:00:00Z`);
      const month = date.getUTCMonth();

      if (month !== previousMonth) {
        monthLabels.push({
          label: date.toLocaleDateString("en", {
            month: "short",
            timeZone: "UTC",
          }),
          column,
        });
        previousMonth = month;
      }
    });

    return { weeks, monthLabels };
  }, [sessions]);

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  const colors = [
    "bg-surface border border-border",
    "bg-[var(--accent)]/25",
    "bg-[var(--accent)]/55",
    "bg-[var(--accent)]",
  ];

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Training Activity</h2>
          <p className="mt-1 text-sm text-muted">
            Your workout consistency over the past year
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-semibold tabular-nums">
            {totalSessions}
          </p>
          <p className="text-xs text-muted">total sessions</p>
        </div>
      </div>

      <div ref={scrollContainerRef} className="mt-6 overflow-x-auto pb-2">
        <div className="min-w-[900px] sm:min-w-full">
          <div className="mb-2 flex gap-3 text-xs text-muted">
            <span className="w-6 shrink-0" aria-hidden="true" />
            <div
              className="grid flex-1 gap-1.5 sm:gap-1"
              style={{
                gridTemplateColumns: `repeat(${calendar.weeks.length}, minmax(10px, 1fr))`,
              }}
            >
            {calendar.weeks.map((_, index) => {
              const month = calendar.monthLabels.find(
                (item) => item.column === index,
              );

              return (
                <span key={index} className="whitespace-nowrap">
                  {month?.label ?? ""}
                </span>
              );
            })}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="grid w-6 shrink-0 grid-rows-7 gap-1.5 text-[10px] text-muted sm:gap-1">
              <span>Sun</span>
              <span />
              <span>Tue</span>
              <span />
              <span>Thu</span>
              <span />
              <span>Sat</span>
            </div>

            <div
              className="grid flex-1 gap-1.5 sm:gap-1"
              style={{
                gridTemplateColumns: `repeat(${calendar.weeks.length}, minmax(10px, 1fr))`,
              }}
            >
              {calendar.weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid grid-rows-7 gap-1.5 sm:gap-1"
                >
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className="group relative aspect-square w-full"
                      onMouseEnter={(event) =>
                        setActiveTooltip({ day, anchor: event.currentTarget })
                      }
                      onMouseLeave={(event) => {
                        if (!event.currentTarget.contains(document.activeElement)) {
                          setActiveTooltip(null);
                        }
                      }}
                    >
                      <div
                        tabIndex={day.future ? -1 : 0}
                        onFocus={(event) =>
                          setActiveTooltip({
                            day,
                            anchor: event.currentTarget.parentElement!,
                          })
                        }
                        onBlur={() => setActiveTooltip(null)}
                        aria-label={`${formatDate(day.date)}: ${day.minutes} minutes trained, ${
                          day.count
                        } ${day.count === 1 ? "session" : "sessions"}`}
                        className={`h-full w-full rounded-[3px] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${colors[day.level]} ${
                          day.future ? "opacity-30" : ""
                        }`}
                      />

                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeTooltip && (
        <ActivityTooltip
          day={activeTooltip.day}
          anchor={activeTooltip.anchor}
        />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>{totalMinutes.toLocaleString()} minutes trained all-time</span>

        <div className="flex items-center gap-2">
          <span>Less</span>
          {colors.map((color, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-[3px] ${color}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  );
}
