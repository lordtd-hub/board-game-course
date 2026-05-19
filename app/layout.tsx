import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Board Game Course",
  description: "Course LMS for strategic thinking through board games"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="th">
      <body>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
