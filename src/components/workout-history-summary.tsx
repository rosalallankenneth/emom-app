"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
};

export default function WorkoutHistorySummary({
  cards,
}: {
  cards: SummaryCard[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section aria-label="Workout statistics">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="workout-history-summary-cards"
        onClick={() => setIsOpen((open) => !open)}
        className="mb-2 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left sm:hidden"
      >
        <span>
          <span className="block text-sm font-semibold">Workout summary</span>
          <span className="mt-0.5 block text-xs text-muted">
            {isOpen ? "Hide statistics" : "Show statistics"}
          </span>
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="workout-history-summary-cards"
        className={isOpen ? "block" : "hidden sm:block"}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {cards.map((card) => (
            <article
              key={card.label}
              className="min-w-0 rounded-xl border border-border bg-surface px-3 py-3"
            >
              <p className="text-[11px] font-medium leading-4 text-muted">
                {card.label}
              </p>
              <p
                className="mt-1.5 break-words text-lg font-semibold leading-6 tracking-tight tabular-nums"
                title={card.value}
              >
                {card.value}
              </p>
              <p className="mt-1 truncate text-[11px] leading-4 text-muted">
                {card.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
