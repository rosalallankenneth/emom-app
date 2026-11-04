
import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EMOM Tracker",
    template: "%s | EMOM Tracker",
  },
  description:
    "A personal training journal for tracking EMOM workouts and progress.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("emom-theme")?.value === "light" ? "light" : "dark";

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
