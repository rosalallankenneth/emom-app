import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function FormMessage({
  type,
  title,
  children,
}: {
  type: "error" | "success";
  title: string;
  children: React.ReactNode;
}) {
  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      className={`flex gap-3 rounded-xl border p-3.5 ${
        isError
          ? "border-danger/30 bg-danger/10"
          : "border-brand/35 bg-brand/10"
      }`}
    >
      <span
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
          isError ? "bg-danger/15 text-danger" : "bg-brand/20 text-brand"
        }`}
      >
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-sm font-semibold ${
            isError ? "text-danger" : "text-foreground"
          }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-5 text-muted">
          {children}
        </span>
      </span>
    </div>
  );
}
