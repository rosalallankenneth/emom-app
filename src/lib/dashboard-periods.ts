
export type DashboardPeriod = "week" | "month" | "year" | "all";

export const DASHBOARD_PERIODS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
] as const;
