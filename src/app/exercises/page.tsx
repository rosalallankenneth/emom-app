
import { prisma } from "@/lib/prisma";
import ExerciseAnalytics, {
  type ExerciseSession,
} from "@/components/exercise-analytics";
import AppShell from "@/components/app-shell";
import { requireAuth } from "@/lib/require-auth";

export default async function ExercisesPage() {
  const session = await requireAuth("/exercises");

  const [records, generatedAt] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        exercise: true,
        workoutDate: true,
        durationMinutes: true,
        repsPerMinute: true,
        externalLoadKg: true,
        createdAt: true,
      },
      orderBy: [
        { workoutDate: "asc" },
        { createdAt: "asc" },
      ],
    }),
    Promise.resolve(new Date().toISOString()),
  ]);

  const sessions: ExerciseSession[] = records.map((session) => ({
    id: session.id,
    exercise: session.exercise,
    workoutDate: session.workoutDate.toISOString().slice(0, 10),
    durationMinutes: session.durationMinutes,
    repsPerMinute: session.repsPerMinute,
    externalLoadKg: session.externalLoadKg,
    createdAt: session.createdAt.toISOString(),
  }));

  return (
    <AppShell>
      <ExerciseAnalytics
        sessions={sessions}
        generatedAt={generatedAt}
      />
    </AppShell>
  );
}
