import { NextRequest, NextResponse } from "next/server";
import { setSessionUser } from "@/lib/session";
import type { Role } from "@/lib/types";

const allowedRoles: Role[] = ["student", "instructor", "super_admin"];

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const roleParam = request.nextUrl.searchParams.get("role") || "student";
  const role = allowedRoles.includes(roleParam as Role) ? (roleParam as Role) : "student";
  await setSessionUser({
    email: role === "student" ? "demo.student@sru.ac.th" : "demo.instructor@sru.ac.th",
    name: role === "student" ? "Demo Student" : "Demo Instructor",
    role,
    status: "active"
  });

  return NextResponse.redirect(new URL("/materials/week/1", request.url));
}
