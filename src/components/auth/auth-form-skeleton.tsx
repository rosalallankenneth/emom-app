export default function AuthFormSkeleton({
  mode,
}: {
  mode: "login" | "register";
}) {
  const fieldCount = mode === "login" ? 2 : 4;

  return (
    <div aria-hidden="true" className="animate-pulse space-y-5">
      {Array.from({ length: fieldCount }, (_, index) => (
        <div key={index}>
          <div className="h-3 w-20 rounded bg-border" />
          <div className="mt-2 h-11 w-full rounded-xl border border-border bg-background" />
          {mode === "register" && index === 2 && (
            <div className="mt-2 h-3 w-40 rounded bg-border" />
          )}
        </div>
      ))}
      <div className="h-11 w-full rounded-xl bg-brand/35" />
    </div>
  );
}
