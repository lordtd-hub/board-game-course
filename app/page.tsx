import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { appConfig } from "@/lib/config";
import { dashboardForSectionIds, listSections } from "@/lib/repository";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();
  let stats = null;

  try {
    const sections = await listSections();
    stats = await dashboardForSectionIds(sections.map((section) => section.id));
  } catch {
    stats = null;
  }

  return (
    <div className="stack">
      <section className="hero">
        <p className="badge">SMA2106</p>
        <h1>ระบบรายวิชาบอร์ดเกม</h1>
        <p className="muted">
          ห้องเรียนออนไลน์สำหรับสื่อ interactive, งานส่ง, การตรวจงาน และภาพรวม 3 section
          ของรายวิชากลยุทธ์และการคิดเชิงวิเคราะห์ผ่านบอร์ดเกม
        </p>
      </section>

      {!user ? (
        <section className="card welcome-card stack">
          <div>
            <h2>เข้าสู่ระบบด้วยบัญชี SRU</h2>
            <p className="muted">ระบบจริงจะใช้ Google account ในโดเมน SRU ตามค่าที่ตั้งไว้</p>
          </div>
          <div className="nav">
            {appConfig.googleOAuthClientId ? <Link className="button" href="/api/auth/google">Sign in with Google</Link> : null}
            {process.env.NODE_ENV !== "production" ? (
              <>
                <Link className="button" href="/api/auth/dev?role=student">Dev login: Student</Link>
                <Link className="button secondary" href="/api/auth/dev?role=instructor">Dev login: Instructor</Link>
              </>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="card welcome-card">
          <h2>สวัสดี {user.name}</h2>
          <p className="muted">{user.email} · {user.role}</p>
          <div className="nav">
            {user.role === "super_admin" ? <Link href="/admin">ไปหน้า Admin</Link> : null}
            {user.role === "instructor" || user.role === "super_admin" ? <Link href="/instructor">ไปหน้า Instructor</Link> : null}
            <Link href="/materials">ไปหน้า Materials</Link>
            <Link href="/student">ไปหน้า Student</Link>
          </div>
        </section>
      )}

      {stats ? (
        <section className="grid">
          <MetricCard label="Sections" value={stats.sections} />
          <MetricCard label="Students" value={stats.students} />
          <MetricCard label="Assignments" value={stats.assignments} />
          <MetricCard label="Pending grades" value={stats.pendingGrades} />
        </section>
      ) : (
        <section className="card">
          <h2>ยังไม่ได้เชื่อม Google Sheet</h2>
          <p className="muted">
            ตอนนี้ยังดูสื่อ interactive ได้ผ่าน Dev login ก่อน เมื่อต้องใช้ระบบจริงค่อยเติมค่า `.env`
            และรัน `npm run sheets:init`
          </p>
        </section>
      )}

      <footer className="hub-credit">
        <strong>ออกแบบและพัฒนาโดย Sittichoke Songsa-ard</strong>
        <span>© 2026 Sittichoke Songsa-ard</span>
      </footer>
    </div>
  );
}
