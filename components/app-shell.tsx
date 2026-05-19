import Link from "next/link";
import type { SessionUser } from "@/lib/types";

export function AppShell({ user, children }: { user: SessionUser | null; children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            Board Game Studio
          </Link>
          <nav className="nav">
            {user?.role === "super_admin" ? <Link className="secondary" href="/admin">Admin</Link> : null}
            {user?.role === "instructor" || user?.role === "super_admin" ? (
              <Link className="secondary" href="/instructor">Instructor</Link>
            ) : null}
            {user ? <Link className="secondary" href="/materials">Materials</Link> : null}
            {user ? <Link className="secondary" href="/student">Student</Link> : null}
            {user ? <Link href="/api/auth/logout">ออกจากระบบ</Link> : <Link href="/api/auth/google">Sign in with Google</Link>}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
