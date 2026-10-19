
"use client";

import { useMemo } from "react";

import type { ExerciseSession } from "./exercise-analytics/analytics-utils";
import { formatDate } from "./exercise-analytics/analytics-utils";

type ActivityDay = {
  date: string;
  count: number;
  minutes: number;
  level: number;
  future: boolean;
};

export default function TrainingActivityCalendar({
  sessions,
}: {
  sessions: ExerciseSession[];
}) {
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
          value.count === 0
            ? 0
            : value.count === 1
              ? 1
              : value.count === 2
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

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          <div
            className="mb-2 grid gap-1 text-xs text-muted"
            style={{
              gridTemplateColumns: `repeat(${calendar.weeks.length}, minmax(0, 1fr))`,
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

          <div className="flex gap-3">
            <div className="grid shrink-0 grid-rows-7 gap-1 text-[10px] text-muted">
              <span>Sun</span>
              <span />
              <span>Tue</span>
              <span />
              <span>Thu</span>
              <span />
              <span>Sat</span>
            </div>

            <div
              className="grid flex-1 gap-1"
              style={{
                gridTemplateColumns: `repeat(${calendar.weeks.length}, minmax(0, 1fr))`,
              }}
            >
              {calendar.weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid grid-rows-7 gap-1"
                >
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className="group relative aspect-square w-full"
                    >
                      <div
                        tabIndex={day.future ? -1 : 0}
                        aria-label={
                          `${formatDate(day.date)}: ${day.count} ${
                            day.count === 1 ? "session" : "sessions"
                          }, ${day.minutes} minutes`
                        }
                        className={`h-full w-full rounded-[3px] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${colors[day.level]} ${
                          day.future ? "opacity-30" : ""
                        }`}
                      />

                      <div
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-max max-w-56 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg group-hover:block group-focus-within:block"
                      >
                        <p className="font-medium">
                          {formatDate(day.date)}
                        </p>

                        <p className="mt-1 text-muted">
                          {day.future
                            ? "Upcoming date"
                            : `${day.count} ${
                                day.count === 1 ? "session" : "sessions"
                              } · ${day.minutes} min`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
