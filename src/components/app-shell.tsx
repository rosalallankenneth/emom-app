
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  LayoutDashboard,
  History,
  Moon,
  Sun,
  CheckCircle2,
  Dumbbell,
  ChartNoAxesCombined,
  LogOut,
} from "lucide-react";

import NewWorkoutModal from "@/components/new-workout-modal";
import { logout } from "@/actions/auth";

const navigation = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Exercises",
    href: "/exercises",
    icon: Dumbbell,
  },
  {
    label: "Training Insights",
    href: "/insights",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Workout History",
    href: "/workouts",
    icon: History,
  },
];

type Theme = "dark" | "light";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-lg font-black text-brand-foreground">
        E
      </div>

      <div>
        <p className="text-sm font-bold tracking-tight">EMOM</p>
        <p className="text-xs text-muted">Training journal</p>
      </div>
    </Link>
  );
}

function SignedInCard({
  name,
  email,
  initials,
  compact = false,
}: {
  name: string;
  email: string | null;
  initials: string;
  compact?: boolean;
}) {
  return (
    <section
      aria-label="Signed in account"
      className={`rounded-2xl border border-border bg-background ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex shrink-0 items-center justify-center rounded-xl bg-brand font-bold text-brand-foreground ${compact ? "size-9 text-xs" : "size-10 text-sm"}`}
        >
          {initials || "A"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Signed in as
          </p>
          <p className="truncate text-sm font-semibold" title={name}>
            {name}
          </p>
          {email && name !== email && (
            <p className="truncate text-xs text-muted" title={email}>
              {email}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useAppToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useAppToast must be used within AppShell.");
  }

  return context;
}

export default function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  const [toast, setToast] = useState<{
    message: string;
  } | null>(null);

  const accountName = user.name?.trim() || user.email || "Account";
  const accountInitials = accountName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark",
    );
  }, []);
  
  function showToast(message: string) {
    setToast({ message });
  }

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);

    try {
      localStorage.setItem("emom-theme", nextTheme);
    } catch {
      // The theme still changes for the current page if storage is unavailable.
    }

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `emom-theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface px-5 py-6 lg:flex">
          <SignedInCard
            name={accountName}
            email={user.email ?? null}
            initials={accountInitials}
          />

          <div className="mt-4">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 ps-5 text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-brand text-brand-foreground"
                        : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <span className="w-5 text-center text-base" aria-hidden="true">
                      <item.icon
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-2xl bg-background p-4">
            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-surface text-lg">
              ↗
            </div>
            <p className="text-sm font-semibold">
              Consistency over intensity.
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Small sessions add up. Keep showing up.
            </p>
          </div>

        </aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Toggle navigation"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-lg lg:hidden"
              >
                ☰
              </button>

              <div className="lg:hidden">
                <Brand />
              </div>

              <div className="hidden lg:block">
                <Brand />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-border"
              >
                {theme === "dark" ? (
                  <Sun size={18} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Moon size={18} strokeWidth={1.8} aria-hidden="true" />
                )}
              </button>

              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </form>
            </div>
          </header>

          {menuOpen && (
            <nav
              id="mobile-navigation"
              className="fixed inset-x-0 top-[72px] z-30 max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-b border-border bg-surface px-4 py-3 shadow-xl lg:hidden"
            >
              <div className="mb-3">
                <SignedInCard
                  name={accountName}
                  email={user.email ?? null}
                  initials={accountInitials}
                  compact
                />
              </div>
              {navigation.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-lg px-3 py-3 text-sm font-bold ${
                      isActive
                        ? "bg-brand text-brand-foreground"
                        : "hover:bg-background"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-8 sm:py-9 xl:px-10">
            {children}
          </main>
        </div>

        <NewWorkoutModal onSaved={showToast} />

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed right-4 top-20 z-[60] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-brand/40 bg-surface px-4 py-3 text-foreground shadow-xl sm:right-8 sm:max-w-md"
          >
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-brand"
              aria-hidden="true"
            />

            <p className="text-sm font-medium">{toast.message}</p>

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="ml-2 text-muted transition-colors hover:text-foreground"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
