// Dashboard layout without authentication requirements
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - EmpathAI",
  description: "Access your EmpathAI dashboard with personalized emotional support tools, conversation history, and therapeutic resources.",
  keywords: "EmpathAI dashboard, personal AI companion, emotional support tools, mental health resources",
  openGraph: {
    title: "Dashboard - EmpathAI",
    description: "Access your personalized EmpathAI dashboard with emotional support tools and resources.",
    siteName: "EmpathAI",
  },
  robots: {
    index: false, // Dashboard pages should not be indexed
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication check needed
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}