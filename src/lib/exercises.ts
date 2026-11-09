
export const EXERCISE_VALUES = [
  "PULL_UPS",
  "PUSH_UPS",
  "ROWS",
  "DIPS",
  "PIKE_PUSH_UPS",
  "SQUATS",
  "SPLIT_SQUATS",
  "RDLS",
  "OTHER",
] as const;

export type ExerciseValue = (typeof EXERCISE_VALUES)[number];
export type StandardExerciseValue = Exclude<ExerciseValue, "OTHER">;

export const EXERCISES = [
  { value: "PULL_UPS", label: "Pull-ups" },
  { value: "PUSH_UPS", label: "Push-ups" },
  { value: "ROWS", label: "Rows" },
  { value: "DIPS", label: "Dips" },
  { value: "PIKE_PUSH_UPS", label: "Pike push-ups" },
  { value: "SQUATS", label: "Squats" },
  { value: "SPLIT_SQUATS", label: "Split squats" },
  { value: "RDLS", label: "Romanian deadlifts (RDLs)" },
] as const satisfies readonly {
  value: StandardExerciseValue;
  label: string;
}[];

export const ALL_EXERCISES = [
  ...EXERCISES,
  { value: "OTHER", label: "Other" },
] as const satisfies readonly { value: ExerciseValue; label: string }[];

export function getExerciseLabel(value: ExerciseValue): string {
  return (
    ALL_EXERCISES.find((exercise) => exercise.value === value)?.label ??
    value
  );
}

export function getWorkoutExerciseLabel(
  value: ExerciseValue,
  customName?: string | null,
): string {
  return value === "OTHER" && customName?.trim()
    ? customName.trim()
    : getExerciseLabel(value);
}
