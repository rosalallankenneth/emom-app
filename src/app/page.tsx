import { Button } from "@heroui/react";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold">
          EMOM Tracker
        </h1>

        <p className="text-default-500">
          Your workout log, without the unnecessary fuss.
        </p>

        <Button variant="primary">
          Test HeroUI
        </Button>
      </div>
    </main>
  );
}