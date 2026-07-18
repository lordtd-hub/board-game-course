import type { Metadata } from "next";
import { listExamSections } from "@/lib/exam/repository.server";
import { MobileExam } from "./mobile-exam";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "SMA2106 Examination",
  robots: { index: false, follow: false, nocache: true }
};

export default async function PublicExamPage() {
  const sections = await listExamSections().catch(() => []);
  return <MobileExam sections={sections} />;
}
